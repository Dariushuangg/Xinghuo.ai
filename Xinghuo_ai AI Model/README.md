# Introduction
To detect and warn the fatigueness and drowsiness of the driver, we train a model to extract facial landmarks from image inputs. We train the model through transfer learning based on the pretrained ResNet50(ImageNet). The datasets are acquired from open source on the Internet.

# Dependency
- Tensorflow 2.x
- opencv

# File structure
- landmark.py: the main function to train the model
- tfrecord_utility.py: Helper function to access and read tfrecord files
- tfrecord: the folder where datasets are located
- logger: the folder where losses of the training are recorded
- testPic: compare the predicted and origional facial landmarks from different dataset.
- Trained_Model: .h5 models resulted from the training/pruning
- pruning.ipynb: prune the size of the model (need manally compile the optimization library to accommodate the model)
- TestModelPicture.py: compare the predicted and orgional landmarks
- TestModelStream: the complete simulation of the product using VisionSeed.
- ModelEvaluation.ipynb: evaluate the loss function on train and test datasets.