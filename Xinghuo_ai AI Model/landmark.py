"""
Convolutional Neural Network for facial landmarks detection.
"""
# import cv2
import numpy as np
from tensorflow import keras
from tensorflow.keras.models import load_model
from tensorflow.keras.callbacks import TensorBoard
import math
import json
import time

from tfrecord_utility import get_parsed_dataset




# The number of facial landmarks the model should output. By default the mark is
# in 2D space.
MARK_SIZE = 32

EPOCHS=10
BATCH_SIZE=32

INIT_LEARNING_RATE = 0.001

class Logger(keras.callbacks.Callback):
    def __init__(self, path):
        super(Logger, self).__init__()
        self.path = path
        self.best = float("inf")
        import os
        os.mkdir(path)

    def on_train_batch_end(self, batch, logs=None):
        file = self.path+"loss.txt"
        with open(file, "a") as text_file:
            text_file.write("batch: {}, loss: {}. \n".format(batch, logs["loss"]))
    
    def on_epoch_end(self, epoch, logs = None):
        file = self.path + "best.txt"
        with open(file, "a") as text_file:
            text_file.write("The average loss for epoch {} is {} \n".format(
                epoch, logs["loss"]
            ))

            


def get_compiled_model(output_size):
    from tensorflow.keras.applications.resnet50  import ResNet50
    from tensorflow.keras.models import load_model, Model
    from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
    
  
    base_model = ResNet50(input_shape=(128,128,3),
                           include_top=False,
                           weights='resnet50_weights_tf_dim_ordering_tf_kernels_notop.h5',
                         )
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.5)(x)
    x = Dense(256, activation='relu')(x)
    predictions = Dense(64)(x)
    model = Model(inputs=base_model.input, outputs=predictions)
    
    optimizer = keras.optimizers.Adam(lr=INIT_LEARNING_RATE)
    
    model.compile(optimizer=optimizer, 
                  metrics=[keras.metrics.mean_squared_error], 
                  loss=keras.losses.mean_squared_error,
                 )
    
    return model
    


def run():
    """Train, eval and export the model."""
    
    NAME = "Xinghuo-driving-{}".format(time.time())

    # Create the Model
    model = get_compiled_model(MARK_SIZE*2)

    # To save and log the training process, we need some callbacks.
    callbacks = [Logger("./logger/LOG-{}/".format(NAME)),
                 keras.callbacks.TensorBoard(log_dir='./log/{}'.format(NAME), update_freq = 10000),
                 keras.callbacks.ModelCheckpoint(filepath='./checkpoints/{}'.format(NAME),
                                                 monitor='loss',
                                                 save_freq='epoch')]

    # Train.
    # Get the training data ready.
    train_dataset = get_parsed_dataset(record_file='./tfrecord/train.record',
                                   batch_size=BATCH_SIZE,
                                       epochs=EPOCHS,
                                       shuffle=True)
    print('Starting to train.')
    model.fit(train_dataset,
              epochs=EPOCHS,
#             steps_per_epoch=TRAINING_STEPS,
              callbacks=callbacks)

    # Evaluate.
    print('Starting to evaluate.')
    eval_dataset = get_parsed_dataset(record_file="./tfrecord/validation.record",
                                      batch_size=BATCH_SIZE,
                                      epochs=1,
                                      shuffle=False)
    evaluation = model.evaluate(eval_dataset)
    print(evaluation)
    
    with open("./eval-{}.txt".format(NAME), "w") as f:
        print(evaluation, file = f)

    # Save the model.
    model.save("./models/resnet-{}.h5".format(NAME))
    print("Saving model to directory: ./models/resnet-{}.h5".format(NAME))
    with open("./complete-{}.txt".format(NAME), "w") as f:
        print("Saving model to directory: ./models/resnet-{}.h5".format(NAME), file = f)

# if __name__ == '__main__':
run()
