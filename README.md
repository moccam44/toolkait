# What is Toolkait

Toolkait is a free and open-source application, accessible from the browser (nothing to download or install).

It allows you to create and train your own neural networks with your own data or data available on the internet, to introduce you to artificial intelligence with no coding skills. With Toolkait, you can :

- Use your own data (in .csv, .parquet, etc.) or choose from thousands of datasets available online. Toolkait can handle numeric data, categories, images, and text.
- Preprocess this data (normalization, tokenization, shuffling, etc.)
- Design your own neural network. You can easily connect different types of layers (dense, convolutional, recurrent, etc.). You can also retrieve models available on the Internet.
- Train your model with your data and visualize the learning process.
- Test your model after training with other data.
- Explore and visualize the interior of your model.

Toolkait will introduce you to the most fundamental concepts of deep learning: classification and regression, image or text classification, image and text generation using autoencoders, 
variational autoencoders, recurrent networks, transformers, diffusion models and many more.

# Installation

Toolakit uses mainly javascript and tfjs. Yet there is a samll part in PHP and mysql for the backend (managing users, storing models and training data)
You must use a web server with mysql and PHP (testsed with PHP 7.4.33 and mysql 5.7.42)

1. copy the toolkait directory in your server root
2. create the mysql DB using the toolkait.sql file
3. edit the php/perso.php file 
 - mysql user, password and database name
 - mail adress (send mail for forgotten password)
 - url of your toolkait installation
5. /saved_data/ and /saved_models/ must have write permissions for the Apache2 (or any other web server) user
6. exemple models can be downloaded from https://toolkait.net/exemple_models.tar.gz and copied in the /exemple_models/ folder
7. run toolkait by accessing the index.php or the toolkait.php files from the browser

# troubleshooting
if you experience PHP notices and warnings try in php.ini
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT &~ E_WARNING & ~E_NOTICE

If yous can't create new user 
Make sur /saved_data/ and /saved models/ have write permissions for Apache2

If you can't upload data files or model files change post_max_size in php.ini


# More infos and contact

- https://toolkait.net
- https://toolkait.net/help.php : infos and tutos
- moccam arobase free dot fr
 