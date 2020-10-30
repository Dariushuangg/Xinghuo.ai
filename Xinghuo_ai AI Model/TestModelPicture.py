import tensorflow as tf
from tfrecord_utility import get_parsed_dataset
import cv2

model = tf.keras.models.load_model("./Trained_Model/resnet-Xinghuo-driving-1603168181.665796.h5")


train_dataset = get_parsed_dataset(record_file="./tfrecord/validation.record",
                                   batch_size=32,
                                   epochs=1,
                                   shuffle=True)

for i in train_dataset:
    # The image to test
    IMG = 10
    img1 = i[0][IMG].numpy()
    img2 = img1.copy()
    points = list(i[1][IMG])
    # print(len(points))
    points = [(int(points[i]*128), int(points[i + 1]*128)) for i in range(0, len(points), 2)]
    for p in points:
        cv2.circle(img1, p, 1, (0, 255, 0))
    cv2.imwrite("./testPic/original.png", img1)

    img = img2.astype("float32").reshape(1,128,128,3)
    points=model.predict([img]).tolist()[0]
    print(len(points))
    points = [(int(points[i]*128), int(points[i + 1]*128)) for i in range(0, len(points), 2)]
    # img2=cv2.resize(img2,(128,128))
    print(img2.shape)
    for p in points:
        cv2.circle(img2, p, 1, (0, 255, 0))
    cv2.imwrite("./testPic/predict.png", img2)


    break

print("done")
