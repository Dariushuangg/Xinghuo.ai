import tensorflow as tf


# CAUTION: The image width, height and channels should be consist with your
# training data. Here they are set as 128 to be complied with the tutorial.
# Mismatching of the image size will cause error of mismatching tensor shapes.
IMG_WIDTH = 128
IMG_HEIGHT = 128
IMG_CHANNEL = 3


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