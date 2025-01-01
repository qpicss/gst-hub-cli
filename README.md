# gst-hub-cli
Certainly! Here's a detailed tutorial on how to use the CLI tool you've developed:

---

# GST-HUB CLI Tool Tutorial

## Introduction

The GST-HUB CLI tool is a command-line interface designed to help you manage projects, authenticate with a server, and perform various operations like cloning repositories and managing environments. This guide will walk you through the setup and usage of the CLI tool.

## Prerequisites

Before using the CLI tool, ensure you have the following installed on your system:

- Node.js (v20 or higher)
- npm (Node Package Manager)
- git (Git version control system)

## Installation

1. **Clone the Repository:**

   First, clone the repository containing the CLI tool to your local machine:

   ```bash
   git clone https://github.com/your-repo/gst-hub-cli.git
   cd gst-hub-cli
   ```

2. **Install Dependencies:**

   Use npm to install the necessary dependencies:

   ```bash
   npm install
   ```



## Usage

The CLI tool provides several commands to perform different operations. Below are the available commands and their usage:

### 1. Display Help

To display help and see all available commands, run:

```bash
gst -h
```

### 2. Authentication

#### a. Save a Token

To save a JWT token for authentication:

```bash
gst -token <your_jwt_token>
```

#### b. Login with Credentials

To login using a username and password from GST-HUB.com:

```bash
gst -login -u <username> -p <password>
```

### 3. Project Management

#### a. Create a New Project

To create a new project:

```bash
gst -new <project_name>
```

#### b. Clone a Repository

To clone a repository, specify the type (`git` or `gst`) and the repository URL or name:

- **Git Repository:**

  ```bash
  gst -c git <repository_url>
  gst --clone git <repository_url>
  ```

- **GST Repository:**

  ```bash
  gst -c gst <service_path>
  gst --clone gst <service_path>
  ```

### 4. Interactive Mode

To enter an interactive menu for more options:

```bash
gst -i
```
Certainly! Below is a text representation of the menu tree for your CLI tool, detailing the options available based on whether a project exists in the directory or not.

---

## Menu Tree

### If the Project Does Not Exist in the Directory

1. **New Project**
   - a. **Project Name**
   - b. **Deployment Type**
     - c. **NodeJs**
     - c. **External Provider**

2. **Clone Options**
   - a. **gst**
     - b. **Artifact Name and Version**
   - a. **git**
     - b. **Artifact Repo Link**

### If the Project Exists in the Directory

1. **Clone Options**
   - a. **gst**
     - b. **Artifact Name and Version**
   - a. **git**
     - b. **Artifact Repo Link**

2. **Environment Management**
   - a. **Start**
   - b. **Stop**
   - c. **Update**
   - d. **Status**
   - e. **Purge**

---

This menu tree provides a clear overview of the options available to users based on the presence of a project in the directory. It helps guide users through the process of creating a new project or managing existing ones.



### 5. Environment Management

Manage your environment with the following commands:

- **Start Environment:**

  ```bash
  gst -env start
  ```

- **Stop Environment:**

  ```bash
  gst -env stop
  ```

- **Update Environment:**

  ```bash
  gst -env update
  ```

- **Check Environment Status:**

  ```bash
  gst -env status
  ```

- **Purge Environment:**

  ```bash
  gst -env purge
  ```

## Error Handling

The CLI tool provides feedback for incorrect usage or errors. Ensure you follow the command syntax correctly. If you encounter issues, check the error messages for guidance.

## Conclusion

This CLI tool is a powerful utility for managing projects and environments efficiently. By following this guide, you should be able to set up and use the tool effectively. For further customization or troubleshooting, refer to the source code and modify it as needed.

--- 

Feel free to reach out if you have any questions or need further assistance!







