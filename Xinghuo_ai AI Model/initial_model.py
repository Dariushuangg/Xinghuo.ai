"""
Convolutional Neural Network for facial landmarks detection.
"""
import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import load_model
import math
import json

# from model import LandmarkModel


# CAUTION: The image width, height and channels should be consist with your
# training data. Here they are set as 128 to be complied with the tutorial.
# Mismatching of the image size will cause error of mismatching tensor shapes.
IMG_WIDTH = 128
IMG_HEIGHT = 128
IMG_CHANNEL = 3

# The number of facial landmarks the model should output. By default the mark is
# in 2D space.
MARK_SIZE = 32

EPOCHS=20
BATCH_SIZE=32

INIT_LEARNING_RATE = 0.001

class BestLogger(keras.callbacks.Callback):
    def __init__(self, file):
        super(BestLogger, self).__init__()
        self.file = file
        self.best = float("inf")

    def on_epoch_end(self, batch, logs={}):
        loss = logs.get('val_loss')
        acc = logs.get('val_acc')
        if math.isinf(self.best) or loss < self.best:
            self.best = loss
            with open(self.file, "w") as text_file:
                obj = {
                    'batch' : batch,
                    'val_loss' : loss,
                    'val_acc' : acc
                }
                print(json.dumps(obj), file=text_file)

def get_compiled_model(output_size):
    
#     from tensorflow.keras.applications.mobilenet  import MobileNet
    from tensorflow.keras.applications.resnet50  import ResNet50
    from tensorflow.keras.models import load_model, Model
    from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
    
  
    base_model = ResNet50(input_shape=(128,128,3),
                           include_top=False,
#                            weights='mobilenet_1_0_128_tf_no_top.h5',
                           weights="imagenet",
                           # weights='resnet50_weights_tf_dim_ordering_tf_kernels_notop.h5',
#                            alpha=1.0,
#                            dropout=1e-3)
                         )
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.5)(x)
    x = Dense(256, activation='relu')(x)
    predictions = Dense(64)(x)
    model = Model(inputs=base_model.input, outputs=predictions)
    
    optimizer = keras.optimizers.Adam(lr=INIT_LEARNING_RATE)
    model.compile(optimizer=optimizer, metrics=[keras.metrics.mean_squared_error], loss=keras.losses.mean_squared_error)
    
    return model
    


def _parse(example):
    """Extract data from a `tf.Example` protocol buffer.
    Args:
        example: a protobuf example.

    Returns:
        a parsed data and label pair.
    """
    # Defaults are not specified since both keys are required.
    keys_to_features = {
        'image/filename': tf.io.FixedLenFeature([], tf.string),
        'image/encoded': tf.io.FixedLenFeature([], tf.string),
        'label/marks': tf.io.FixedLenFeature([64], tf.float32),
    }
    parsed_features = tf.io.parse_single_example(example, keys_to_features)

    # Extract features from single example
    image_decoded = tf.image.decode_image(parsed_features['image/encoded'])
    image_reshaped = tf.reshape(
        image_decoded, [IMG_HEIGHT, IMG_WIDTH, IMG_CHANNEL])
    image_float = tf.cast(image_reshaped, tf.float32)
    points = tf.cast(parsed_features['label/marks'], tf.float32)

    return image_float, points


def get_parsed_dataset(record_file, batch_size, epochs=None, shuffle=True):
    """Return a parsed dataset for model.
    Args:
        record_file: the TFRecord file.
        batch_size: batch size.
        epochs: epochs of dataset.
        shuffle: whether to shuffle the data.

    Returns:
        a parsed dataset.
    """
    # Init the dataset from the TFRecord file.
    dataset = tf.data.TFRecordDataset(record_file)

    # Use `Dataset.map()` to build a pair of a feature dictionary and a label
    # tensor for each example.
    if shuffle is True:
        dataset = dataset.shuffle(buffer_size=10000)
    dataset = dataset.map(
        _parse, num_parallel_calls=tf.data.experimental.AUTOTUNE)
    dataset = dataset.batch(batch_size)
    dataset = dataset.repeat(epochs)
    dataset = dataset.prefetch(buffer_size=tf.data.experimental.AUTOTUNE)

    return dataset


def run():
    """Train, eval and export the model."""

    # Create the Model
    mark_model = get_compiled_model(MARK_SIZE*2)

    # To save and log the training process, we need some callbacks.
    callbacks = [keras.callbacks.TensorBoard(log_dir='./log', update_freq=1024),
#                  BestLogger('/home/tione/log/best.json'),
                 keras.callbacks.ModelCheckpoint(filepath='./train',
                                                 monitor='loss',
                                                 save_freq='epoch')]

    # Train.
#     if not args.export_only:# and not args.eval_only:
    if True:
        # Get the training data ready.
        train_dataset = get_parsed_dataset(record_file='./tfrecord/train.record',
                                           batch_size=BATCH_SIZE,
                                           epochs=EPOCHS,
                                           shuffle=True)
        print('Starting to train.')
        _ = mark_model.fit(train_dataset,
                           epochs=EPOCHS,
#                            steps_per_epoch=TRAINING_STEPS,
                           callbacks=callbacks)

    # Evaluate.
#     if not args.export_only:
    if True:
        print('Starting to evaluate.')
        eval_dataset = get_parsed_dataset(record_file="./tfrecord/validation.record",
                                          batch_size=BATCH_SIZE,
                                          epochs=1,
                                          shuffle=False)
        evaluation = mark_model.evaluate(eval_dataset)
        print(evaluation)

    # Save the model.
#     if args.export_dir:
    if True:
        #print("Saving model to directory: {}".format("/home/tione/saved_model1"))
        mark_model.save("saved_resnet.h5")
        #mark_model.save_weights('/home/tione/saved_model/easy_checkpoint')


if __name__ == '__main__':
    run()
