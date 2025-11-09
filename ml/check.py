import tensorflow as tf
# print("GPUs Available:", tf.config.list_physical_devices('GPU'))

import torch
print(torch.cuda.is_available())
print(torch.cuda.get_device_name(0))

