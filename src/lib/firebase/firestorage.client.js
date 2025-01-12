import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from '$lib/firebase/firebase.client' // import your initialized firebase app
import { getAuth } from 'firebase/auth';

/**
 * Asynchronously save a file to a Firebase storage bucket.
 *
 * @param {File} file - The file to be saved.
 * @param {string} destination - The path where the file will be saved.
 * @returns {Promise<string>} - A promise that resolves with the download URL of the saved file.
 */
export async function saveFileToBucket(file, destination) {
    // console.log("Path: ", destination); // Log the path
    // console.log("File name: ", file.name); // Log the file name

    // Initialize Firebase auth and get the currently signed-in user
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (user) {
        console.log("User is signed in with uid client: ", user.uid);
    } else {
        console.log("No user is signed in.");
        throw new Error("No user is signed in."); // Throw an error if no user is signed in
    }
  
    // Get a reference to the Firebase storage service and the specified destination
    const storage = getStorage(app);
    const storageRef = ref(storage, destination);
  
    // Start the resumable upload
    const uploadTask = uploadBytesResumable(storageRef, file);
  
    // Return a promise that resolves with the download URL of the uploaded file
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          // Handle unsuccessful uploads
          console.log('Upload failed with error: ', error); // Log the error
          reject(error);
        },
        () => {
          // Handle successful uploads on complete
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // console.log('File successfully uploaded. Download URL: ', downloadURL); // Log the download URL
            resolve(downloadURL);
          }).catch((error) => {
            console.log('Failed to get download URL with error: ', error); // Log the error
            reject(error);
          });
        }
      );
    });
  }

/**
 * Asynchronously delete a file from a Firebase storage bucket.
 *
 * @param {string} filePath - The path of the file to be deleted.
 * @returns {Promise<void>} - A promise that resolves when the file is deleted.
 */
export async function deleteFileFromBucket(filePath) {
  // Get a reference to the Firebase storage service and the specified file
    const storage = getStorage(app);
    const fileRef = ref(storage, filePath);

    try {
        // Delete the file
        await deleteObject(fileRef);
        console.log('File successfully deleted.');
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error; // re-throw the error so it can be handled by the caller
    }
}