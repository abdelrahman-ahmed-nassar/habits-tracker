How to build a Node.js Express React app as one executable file that runs on Windows, Linux, and Mac OS 🏩
#
node
#
react
#
express
#
javascript
We're going to make it as easy as possible for users to run Node applications. There is no need to install Node.js and learn how to build apps with packages with hundreds or thousands of files. This simple tutorial will show you how to turn your Node.js, Express, and React project into a single executable application that you can simply double-click to run.

Why build an app as a single executable file?
Run without dependencies: There is no need to install packages with npm, as all the necessary libraries are combined into one executable file. You don't need to download hundreds or even thousands of files via npm install to deploy the application - all the necessary components will be available in a single file.

Easy to run: No Node.JS installation required and no npm, simplifying the process of building and running the app. Of course, users can use Docker or Kubernetes, but not everyone knows how to work with them. So running the program should be as simple and intuitive as possible.

Let's get started!
As an example, let's use a project that has two large logical blocks, and therefore two main folders:

client - the client part, written in React
server - the server part, a simple Express server
To build our project, we'll use the popular PKG package. Let's install it first:

npm install -g pkg
The next step is to build our React application. To do this, go to the client folder and run the command

npm run build
Then, copy the "Build" folder to the root directory of the server folder. In order for our server to display a page for each request, we will include the index.html file in our React application. We will add the following code to our server application's code:

const path = require('path')

...


app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})
To build your app successfully open the package.json file in the the server folder. Add a code block that lists all the folders that need to be included in the build process.

"pkg": {
    "assets": [
      "controllers/*",
      "middleware/*",
      "models/*",
      "routes/*",
      "build"
    ],
    "output": "dist"
}
The resulting package.json file might look something like this.

{
  "name": "app_name",
  "version": "0.1.0",
  "description": "",
  "bin": "app.js",
  "main": "app.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "gen_vapid_keys": " web-push generate-vapid-keys [--json]"
  },
  "pkg": {
    "assets": [
      "controllers/*",
      "middleware/*",
      "models/*",
      "public",
      "routes/*",
      "build"
    ],
    "output": "dist"
  },
  "author": "hubio",
  "license": "MIT",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "body-parser": "^1.19.0",
    "cors": "^2.8.5",
    "express": "^4.17.1",
    "moment": "^2.29.2",
    "mysql2": "^2.2.5",
    "pkg": "^5.8.1",
    "sequelize": "^6.6.5",
  }
}
Your project's list of dependencies will be different, it is just an example.

Next, in the terminal, inside the server folder, we start the build process using the command:

pkg .
If you run the above command, you will get three files: one for Windows, one for Linux, and one for Mac OS.

If you only need to build a package for a specific operating system, just add the necessary parameters after the word "pkg", for example:

pkg –t node-18-win .
A couple of minutes and your app will be ready! 🎉

Now, any user can launch your application on a Windows computer simply by double-clicking.

Small addition
You may not always be able to include all the data for your app in the final executable file. A simple example is a configuration file that contains the username and password to connect to the database. In this case, the application needs to access an external config file. To do this, you need to specify the relative path to the config file in the server app.

filename="./config.json"
let rawdata = fs.readFileSync(filename)
let config = JSON.parse(rawdata)
You can access data from the config file, as usual:

const PORT = config.PORT || 8080
Similarly, you can specify the path to an external folder where files uploaded through the app will be saved.

You can see how the finished application works by using the example of our project and task management system Hubio. It can be downloaded and installed on a computer for personal use, or on a server, and used over the internet or on a local network.