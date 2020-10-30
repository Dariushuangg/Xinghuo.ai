# -*- coding:utf-8 -*-
import numpy as np
import cv2

from visionseed import YtVisionSeed, YtDataLink
import serial
import time

cap = cv2.VideoCapture(1)

vs = YtVisionSeed(serial.Serial("COM4", 115200, timeout=0.5))

BaselineConfirmed = False
baseline = {}
baselineCollection = {'left':[], 'right':[], 'mouse': []}

eyeTimer = 0
durationTimer = 0
eyeStatusCounter = [0, 0]

toSend = [False, False, False, False]

while(True):
    # Capture frame-by-frame
    ret, frame = cap.read()
    result, msg = vs.recvRunOnce()

    
    if result:
        YtVisionSeedModel = YtDataLink.YtVisionSeedModel
        count = result.getResult([YtVisionSeedModel.FACE_DETECTION])
        if count:
            toSend[0] = True

            rect = result.getResult([YtVisionSeedModel.FACE_DETECTION, 0])
            # print("rect", rect)
            if rect:
                # print('rect: (%d, %d, %d, %d) ' % (rect.x, rect.y, rect.w, rect.h))
                cv2.rectangle(frame, (rect.x, rect.y + rect.h),
                              (rect.x + rect.w, rect.y),
                              (0, 255, 0), 3)
            points = result.getResult(
                [YtVisionSeedModel.FACE_DETECTION, 0, 20])
            points = [(int(rect.w*points.array[i]) + rect.x, int(rect.h*points.array[i + 1]) + rect.y)
                      for i in range(0, len(points.array) - 1, 2)]
            tmp = [1, 5, 2, 4, 3, 0, 7, 11, 8, 9, 6, 7, 10,
                   14, 15, 16, 20, 21, 22, 18, 12]
            for p in tmp:
                cv2.circle(frame, points[p], 1, (0, 255, 0), -1)

            RIGHT = 6
            COOR_X = 0
            COOR_Y = 1
            left_eye_openess = (points[1][COOR_Y] - points[5][COOR_Y] + points[2][COOR_Y] -
                                points[4][COOR_Y]) / 2 / (points[0][COOR_X] - points[3][COOR_X])
            right_eye_openess = (points[RIGHT + 1][COOR_Y] - points[RIGHT + 5][COOR_Y] + points[RIGHT + 2]
                                 [COOR_Y] - points[RIGHT + 4][COOR_Y]) / 2 / (points[RIGHT + 0][COOR_X] - points[RIGHT + 3][COOR_X])
            mouse_openess = (points[14][COOR_Y] + points[15][COOR_Y] + points[16][COOR_Y] - points[20][COOR_Y] -
                             points[21][COOR_Y] - points[22][COOR_Y]) / -3 / (points[18][COOR_X] - points[12][COOR_X])

            frame = cv2.putText(frame, "left_eye"+str(left_eye_openess), (800, 100),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
            frame = cv2.putText(frame, "right_eye"+str(right_eye_openess), (800, 200),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
            frame = cv2.putText(frame, "mouse_openess"+str(mouse_openess), (800, 300),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
            frame = cv2.putText(frame, "baselines"+str([round(i, 2) for i in baseline.values()]), (700, 400),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)

            if not BaselineConfirmed:
                if len(baselineCollection['left']) < 20:
                    baselineCollection['left'].append(left_eye_openess)
                    baselineCollection['right'].append(right_eye_openess)
                    baselineCollection['mouse'].append(mouse_openess)
                else:
                    baseline['left'] = sum(baselineCollection['left']) / 20
                    baseline['right'] = sum(baselineCollection['right']) / 20
                    baseline['mouse'] = sum(baselineCollection['mouse']) / 20
                    BaselineConfirmed = True
                    del baselineCollection
            
            else:
                    
                alertStatus = []
                if left_eye_openess < 0.8*baseline['left']:
                    alertStatus.append(True)
                else:
                    alertStatus.append(False)

                if right_eye_openess < 0.8*baseline['right']:
                    alertStatus.append(True)
                else:
                    alertStatus.append(False)

                if mouse_openess > 1.5*baseline['mouse']:
                    alertStatus.append(True)
                    toSend[2] = True
                else:
                    alertStatus.append(False)
                    toSend[2] = False
                
                frame = cv2.putText(frame, "alertStatus: "+str(alertStatus), (500, 50),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)

                if alertStatus[0] or alertStatus[1]:
                    if eyeTimer == 0:
                        eyeTimer = time.time()
                    frame = cv2.putText(frame, "eyeTimer: "+str(time.time() - eyeTimer), (100, 100),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                    
                    toSend[1] = time.time() - eyeTimer > 2
                    
                    eyeStatusCounter[0] += 1
                else:
                    toSend[1] = False

                    eyeTimer = 0

                    eyeStatusCounter[1] += 1

                if durationTimer == 0:
                    durationTimer = time.time()
                
                frame = cv2.putText(frame, "durationTimer: "+str(time.time() - durationTimer), (100, 300),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
                frame = cv2.putText(frame, "eyeStatusCounter: "+str(eyeStatusCounter), (100, 400),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)

                if time.time() - durationTimer > 15:
                    prop = eyeStatusCounter[0] / (eyeStatusCounter[0] + eyeStatusCounter[1])
                    if len(baseline) < 4:
                        baseline['duration'] = prop
                    if prop > 1.2 * baseline['duration']:
                        toSend[3] = True
                    else:
                        toSend[3] = False
                    eyeStatusCounter = [0, 0]
                    durationTimer = time.time()
                

        else:
            toSend = [False] * 4
            durationTimer = 0
            eyeTimer = 0
            eyeStatusCounter = [0, 0]
        
        frame = cv2.putText(frame, "toSend: "+str(toSend), (100, 500),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
            

    # Display the resulting frame
    cv2.imshow('frame', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# When everything done, release the capture
cap.release()
cv2.destroyAllWindows()
