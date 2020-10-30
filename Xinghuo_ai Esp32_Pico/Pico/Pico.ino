//VisionSeed相关库
#include <DataLinkArduino.h>
#include <YtFaceAlignment.h>
#include <pb_decode.h>
#include <math.h>

// BLE蓝牙相关库
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

//VisionSeed相关初始化
#if defined(ARDUINO_ARCH_STM32)
YtDataLink dl(new YtSerialPortArduino(&Serial2));
#elif defined(ARDUINO_ARCH_ESP32)
YtDataLink dl(new YtSerialPortArduino(&Serial1));
#endif
YtFaceShape shape;

//BLE蓝牙相关初始化
BLEServer *pServer = NULL;            //BLE服务器
BLECharacteristic *pTxCharacteristic; //BLE文本
bool deviceConnected = false;         //当前设备是否连接
bool oldDeviceConnected = false;      //之前设备是否连接  两个变量组合判断连接具体状态

#define DATA_LENGTH 32        //接收数据最大长度
const char *start = "start";  //开始检测记号
char data[DATA_LENGTH] = {0}; //接收数据

#define SERVICE_UUID "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"           // 定义收发服务的UUID（唯一标识）
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E" // RX串口标识
#define CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E" // TX串口标识

/*
-------------------------------------------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------------------------
*/

//BLE 判断设备是否连接成功
class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    deviceConnected = true;
  };
  void onDisconnect(BLEServer *pServer)
  {
    deviceConnected = false;
  }
};

//BLE 接收数据
class MyCallbacks : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  {
    //获取数据
    std::string rxValue = pCharacteristic->getValue();

    //接收到数据后
    if (rxValue.length() > 0)
    {
      //ESP32中展示结果
      Serial.println("*********");
      Serial.print("Received Value: ");
      Serial.print(rxValue.c_str());
      Serial.println(); //println按行打印, print按字节打印
      Serial.println("*********");
      Serial.println();
    }

    //保存数据到data
    memset(data, 0, DATA_LENGTH);
    //防止数据长度超过接收数据最大长度
    if (rxValue.length() <= DATA_LENGTH)
    {
      memcpy(data, rxValue.c_str(), rxValue.length());
    }
    else
    {
      memcpy(data, rxValue.substr(0, DATA_LENGTH).c_str(), DATA_LENGTH);
    }
  }
};

/*
-------------------------------------------------------------------------------------------------------------------

-------------------------------------------------------------------------------------------------------------------
*/

// Constants that may be changed
#define CLOSE_THR 2  // 超过2s的闭眼
#define BLINK_THR 70 // 一分钟眨眼超过70次
#define YAWN_THR 5   // 一分钟打哈欠超过5次

// ------------------------------------------------------------------------------------------------------------------

// setup()在复位或上电后运行一次:
// 初始化变量 启动 蓝牙服务
void setup()
{

  // 初始化蓝牙设备
  BLEDevice::init("Drowsy_Detector_ESP32"); // Smile_ESP32为设备名称
  // 为蓝牙设备创建服务器
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // 基于SERVICE_UUID来创建一个服务
  BLEService *pService = pServer->createService(SERVICE_UUID);
  // 基于CHARACTERISTIC_UUID_TX定义TX串口(发数据）
  pTxCharacteristic = pService->createCharacteristic(
      CHARACTERISTIC_UUID_TX,
      BLECharacteristic::PROPERTY_NOTIFY);
  pTxCharacteristic->addDescriptor(new BLE2902());
  // 基于CHARACTERISTIC_UUID_RX定义RX串口(收数据）
  BLECharacteristic *pRxCharacteristic = pService->createCharacteristic(
      CHARACTERISTIC_UUID_RX,
      BLECharacteristic::PROPERTY_WRITE);
  pRxCharacteristic->setCallbacks(new MyCallbacks());

  // 开启服务
  pService->start();
  // 开启通知
  pServer->getAdvertising()->start();

  //初始化调试信息输出端口
  Serial.begin(115200);
  //打印通知
  Serial.println("Waiting a client connection to notify...");
  Serial.println();
}

/*
  @parameters: YtVisionSeedResultTypePoints
  @description: Use distance formula to calculate the Euler distance
  @return: float the distance of two points
*/
float distance(YtVisionSeedResultTypePoints::Point &a, YtVisionSeedResultTypePoints::Point &b)
{
  return sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

/*
  @parameters: boolean - the status of the factors to evaluate drowsiness
  @description: Encode the status into sendable texts and send it.
  @return: void
  @note: may use shift operations to speed up the encryption. Or maybe I can transmit several value?
*/
void sendStatus(bool *toSend)
{
  if (sizeof(toSend) != 4)
  {
    Serial.print("unexpected ToSend file length: ");
    Serial.println(sizeof(toSend));
  }

  uint16_t stat = 0;
  if (toSend[0])
  {
    stat++;
    stat *= 10;
    if (toSend[1])
    {
      stat++;
    }
    stat *= 10;
    if (toSend[2])
    {
      stat++;
    }
    stat *= 10;
    if (toSend[3])
    {
      stat++;
    }
  }

  Serial.print("Sent status: ");
  Serial.println(stat);

  pTxCharacteristic->setValue(stat); //设置传出文本
  pTxCharacteristic->notify();       //蓝牙传输
}

bool toSend[4] = {true, false, false, false};

unsigned long eyeStartTime = 0;
bool EyeBuffer = true;     // 传感器读数
bool lastIfEyeSafe = true; // 状态判断
uint8_t blinkCounter = 0;

bool lastIfMouseSafe = true;
uint8_t yawnCounter = 0;

unsigned long freqStartTime = 0;

bool BaselineConfirmed = false;
double baseline[4] = {0, 0, 0, 0};
uint8_t baselineSamplingRound = 0;



unsigned long eyeTimer = 0;
unsigned long mouseTimer = 0;
unsigned long durationTimer = 0;
uint8_t eyeStatusCounter[2] = {0, 0};


// loop()一直循环执行:
void loop()
{

  //获取VisionSeed数据
  const uint8_t *message = dl.recvRunOnce();

  // message to send to the BLE

  //获取到有效信息
  if (message)
  {

    //初始化
    uint32_t count = 0; //人脸个数

    YtDataLink::getResult(message, &count, {VS_MODEL_FACE_DETECTION}); //获取人脸个数

    //        Serial.println(count);

    //如果检测到人脸
    if (count > 0)
    {
      Serial.println("face detected");

      //初始化
      YtVisionSeedResultTypePoints points = {.count = 0, .p = 0}; //配准点
      YtVisionSeedResultTypeArray pts = {.count = 0, .p = 0};

      //仅获取最大人脸
      int i = 0;

      YtDataLink::getResult(message, &pts, {VS_MODEL_FACE_DETECTION, i, 20});
      //            Serial.println(pts.count);
      //            for(int index = 0; index < pts.count; index++){
      //              Serial.print(pts.p[index]);
      //              Serial.print(" ");
      //            }
      //            Serial.println();

      toSend[0] = true;

      float mouse_openess;
      float left_eye_openess;
      float right_eye_openess;
      // float confidence = 0;

      // Calculate the ratios of Mouse and Eyes (left and right), as well as the confidence
      if (pts.count > 0)
      {
#define RIGHT 6
        left_eye_openess = (pts.p[1 * 2 + 1] - pts.p[5 * 2 + 1] +
                            pts.p[2 * 2 + 1] - pts.p[4* 2 + 1]) /
                           2 / (pts.p[0 * 2] - pts.p[3 * 2]);
        right_eye_openess = (pts.p[(RIGHT + 1) * 2 + 1] - pts.p[(RIGHT + 5) * 2 + 1] +
                             pts.p[(RIGHT + 2) * 2 + 1] - pts.p[(RIGHT + 4) * 2 + 1]) /
                            2 / (pts.p[(RIGHT + 0) * 2] - pts.p[(RIGHT + 3) * 2]);
        mouse_openess = (pts.p[14 * 2 + 1] + pts.p[15 * 2 + 1] + pts.p[16 * 2 + 1] -
                         pts.p[20 * 2 + 1] - pts.p[21 * 2 + 1] - pts.p[22 * 2 + 1]) /
                        -3 / (pts.p[18 * 2] - pts.p[12 * 2]);
      }

      // //Debug codse
      Serial.print("l_eye: ");
      Serial.print(left_eye_openess);
      Serial.print("/ r_eye: ");
      Serial.print(right_eye_openess);
      Serial.print("/ mouse: ");
      Serial.print(mouse_openess);

      if(!BaselineConfirmed){
        if(baselineSamplingRound == 20){
          BaselineConfirmed = true;
          for(int i = 0; i < 3; i++){
            baseline[i] /= 20;
          }
        }else{
          baseline[0] += left_eye_openess;
          baseline[1] += right_eye_openess;
          baseline[2] += mouse_openess;
          baselineSamplingRound++;
        }
      }else{
        bool alertStatus[3] = {false, false, false};
        if(left_eye_openess < 0.8 * baseline[0]) alertStatus[0] = true;
        if(right_eye_openess < 0.8 * baseline[1]) alertStatus[1] = true;
        
        if(mouse_openess > 1.5 * baseline[2]){
          alertStatus[2] = true;
          if(mouseTimer == 0) mouseTimer = millis();
          toSend[2] = millis() - mouseTimer > 2000;
          Serial.print("/ m_Timer: ");
          Serial.print(millis() - eyeTimer);
        }else{
          toSend[2] = false;
        }

        Serial.print("/ altSta: ");
        for(bool status: alertStatus){
          Serial.print(status);
          Serial.print(" ");
        }

        Serial.print(" / basel: ");
        for(double b : baseline){
          Serial.print(b);
          Serial.print(" ");
        }

        if(alertStatus[0] || alertStatus[1]){
          if(eyeTimer == 0) eyeTimer = millis();
          toSend[1] = millis() - eyeTimer > 2000;
          Serial.print("/ eyeTimer: ");
          Serial.print(millis() - eyeTimer);

          eyeStatusCounter[0]++;
        }else{
          toSend[1] = false;
          Serial.print("/ eyeTimer: ");
          Serial.print(0);
          

          eyeTimer = 0;

          eyeStatusCounter[1]++;
        }
        

        if(durationTimer == 0 ) durationTimer = millis();

        Serial.print(" / durTimer: ");
        Serial.print(millis() - durationTimer);

        if(millis() - durationTimer > 15000){
          double prop = eyeStatusCounter[0] / (double)(eyeStatusCounter[0] + eyeStatusCounter[1]);
          // Serial.print(" / prop: ");
          // Serial.print(prop);
          if(baseline[3] == 0.0) baseline[3] = prop;
          else{
            if(prop > 1.5 * baseline[3]){
              toSend[3] = true;
            }else{
              toSend[3] = false;
            }
          } 
          eyeStatusCounter[0] = 0;
          eyeStatusCounter[1] = 0;

          durationTimer = millis();
        }

        Serial.print(" / eyeCt: ");
        Serial.print(eyeStatusCounter[0]);
        Serial.print(" ");
        Serial.print(eyeStatusCounter[1]);

      }

    }
    else
    {
      // 无法检测到人脸
      Serial.println("no face");
      for(int i = 0; i < sizeof toSend / sizeof *toSend; i++){
        toSend[i] = false;
      }
      durationTimer = 0;
      eyeTimer = 0;
      eyeStatusCounter[0] = 0;
      eyeStatusCounter[1] = 0;
//      for(int i = 0; i < sizeof baseline / sizeof *baseline; i++){
//        baseline[i] = 0;
//      }
      // freqStartTime = 0;
      // eyeStartTime = 0;
    }
    Serial.print(" / toSend: ");
    for(bool send: toSend){
      Serial.print(send);
      Serial.print(" ");
    }
    sendStatus(toSend);
    Serial.println();
  }

  // 没有新连接时
  if (!deviceConnected && oldDeviceConnected)
  {
    // 给蓝牙堆栈准备数据的时间
    delay(500);
    // 重新开始广播
    pServer->startAdvertising();
    Serial.println("start advertising");
    //更新设备状态
    oldDeviceConnected = deviceConnected;
  }

  // 正在连接时
  if (deviceConnected && !oldDeviceConnected)
  {
    // 正在连接时记录状态
    oldDeviceConnected = deviceConnected;
  }
}
