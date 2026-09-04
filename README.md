# **Device Customization Portal**

A comprehensive hardware device request portal designed to streamline the process for clients to request customized hardware devices with company-specific requirements. This platform enables businesses to manage device customization requests efficiently while providing secure asset management and role-based access control.

## Video Demo
![](https://github.com/Vikkesh/Device-Customization-Portal-demo/blob/main/Recording2026-05-31174838-ezgif.com-video-to-gif-converter.gif)
## User Roles

- **Client**: Submit hardware device requests with custom specifications and requirements
- **Admin**: Manage users, projects, devices, and oversee the entire request workflow

## Features

### 🖥️ **Device Request Management**
- Comprehensive hardware device request portal
- Customized company-specific requirement handling
- Request tracking and status management
- Device specification customization options

### 📁 **Asset Management System**
- Support for multiple asset types including:
  - Custom wallpapers and themes
  - Ringtones and sound effects
  - Preloaded applications (APK files)
  - Custom boot animations
  - Device model information and specifications
  - Installation packages and utilities

### 👀 **File Preview System**
- Instant file viewing using temporary Blob URLs
- Preview functionality before final submission
- Support for various file formats and media types
- Client-side file validation and processing

### ☁️ **Cloud Storage Integration**
- AWS S3 integration for robust and scalable cloud storage
- Presigned URL generation for secure file retrieval
- Automated file organization and management
- High availability and data redundancy

### 🔐 **Role-Based Access Control**
- Comprehensive user management system
- Project-based access control and permissions
- Device management functionality for administrators
- Secure authentication and authorization workflows

### 📊 **Project Management**
- Project creation and assignment capabilities
- Progress tracking and milestone management
- Client communication and collaboration tools
- Administrative oversight and reporting

## Tech Stack

| Layer              | Technology                           |
|-------------------|--------------------------------------|
| **Frontend**       | React.js with responsive design      |
| **Backend**        | Node.js, Express.js                 |
| **Database**       | MySQL with optimized querying       |
| **Cloud Storage**  | AWS S3 with presigned URLs          |
| **Authentication** | JWT with role-based access control  |
| **File Handling**  | Blob URLs for temporary previews    |
| **Security**       | Secure file upload and retrieval    |

## Key Technical Achievements

- **Secure File Management**: Implemented presigned URL system for secure file access without exposing credentials
- **Efficient Preview System**: Temporary Blob URL generation for instant file previews
- **Scalable Storage**: AWS S3 integration ensuring reliable and scalable asset storage
- **Flexible Asset Support**: Comprehensive support for diverse file types and device customization assets
- **Access Control**: Robust role-based system managing user permissions across projects and devices

## Screenshots

> **📸 Demo Screenshots Available**
![Image](https://github.com/user-attachments/assets/36b48c38-b45e-4e27-b282-fc2c2abfc42c)
![Image](https://github.com/user-attachments/assets/e84cd971-b565-465e-9891-909ad854e430)
![Image](https://github.com/user-attachments/assets/f15d374e-f0e1-4063-ba50-f8956068942e)
![Image](https://github.com/user-attachments/assets/776b3bea-e6f4-433e-82d7-f8dc9a48617d)
![Image](https://github.com/user-attachments/assets/74983203-3edc-49db-b5f2-80f9f2c001d0)
![Image](https://github.com/user-attachments/assets/253cf61a-46a7-41f2-bbbe-aa137e7172ce)
![Image](https://github.com/user-attachments/assets/94d8c3fc-5b67-44a1-8819-ca3e03663acf)
![Image](https://github.com/user-attachments/assets/055d4e32-4979-42a1-a2c5-af10df24c9e1)

### Client Request Interface
*Intuitive device request submission with custom requirements*

### Asset Upload System
*Comprehensive asset management with preview capabilities*

### Admin Dashboard  
*Complete project and user management interface*

### File Preview System
*Instant file viewing with temporary Blob URL technology*

## API Documentation

The portal provides comprehensive RESTful APIs for all functionalities:

- **Authentication**: User login, registration, and role management
- **Device Requests**: Request submission, tracking, and management
- **Asset Management**: File upload, preview, and storage operations
- **Project Management**: Project creation, assignment, and tracking
- **User Management**: Admin controls for user and permission management
- **AWS Integration**: Secure file operations with presigned URLs
