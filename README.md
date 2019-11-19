# Sharfis Web
👨🏽‍💻🗂📄 Assignment for 'Distributed Systems' subject about Implementation of Rest File Sharing System.

## How to run
To run the aplication, you need to type the following command: `npm i` to install the dependencies, after that, you need to run the command to deploy locally: `npm start`.
After doing these steps, your internet browser will open in [localhost:3000](http://localhost:3000).

## More Informations
This project is developed using the programming language NodeJS. And it was developed by [Gabriel Sacca](https://github.com/Gabrields1998) and [Vitor Camargo](https://github.com/vitorCamargo), students of the Bachelor of Computer Science course at the Federal Technological University of Paraná - campus Campo Mourão (UTFPR-CM). This program was developed in the semester 2019/2, for the discipline Compilers, taught by Professor [Rodrigo Campiolo](https://github.com/campiolo), from the Computing Department of UTFPR-CM (DACOM).

### Theme
Create a web system for sharing files using Rest API.

### Team
- [Gabriel Sacca](https://github.com/Gabrields1998)
- [Vitor Camargo](https://github.com/vitorCamargo)

### Interface
- Sign up user;
- Login System for users (using email or username);
- Edit profile or delete it;
- Directory System:
  - Private File System;
  - Public (Sharing) File System;
  - Global File System (Anyone can use);

It's possible in any Directory System:
- Add new files, images, movies and blobs;
- Update the files or directories;
- Also remove and see them;
- move files between the directories;

It's possible to sharing a file with another user by their email or username;

### Architecture
The users is going to use the system through a web application using ReactJS. The architecture of project has a client/server structure, the server will have a connection (using REST API) with a database, which one, will keep the path for the files and directories, and a connection with a blob server (using Cloudinary API).

### Technologies

|  Software  |                                            Used For                                            |  Software  |
|:----------:|:----------------------------------------------------------------------------------------------:|:----------:|
|   ReactJS  | JavaScript library for building user interfaces.                                               |   16.9.0   |
| AntDesign  | UI design language and React-based implementation with a set of high-quality React components. |   3.22.0   |
|   NodeJS   | Focused on migrating client-side Javascript to servers.                                        |   11.10.1  |
|   MongoDB  | MongoDB is a document-oriented database program, classified as a NoSQL database program.       |   -------  |
|   Heroku   | Cloud platform as a service supporting javascript language.                                    |   -------  |
|    mLab    | mLab is a fully managed cloud database service that hosts MongoDB databases.                   |   -------  |
| Cloudinary | Provides a cloud-based image and video management solution (files too).                        |   -------  |
