import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from '$lib/firebase/firebase.client' // import your initialized firebase app
import { getAuth } from 'firebase/auth';

/**
 * @param {File} file
 * @param {string} destination
 */
export async function saveFileToBucket(file: File, destination: string): Promise<string> {
    // console.log("Path: ", destination); // Log the path
    // console.log("File name: ", file.name); // Log the file name

    const auth = getAuth(app); // Initialize auth
    const user = auth.currentUser; // Get the currently signed-in user

    if (user) {
        console.log("User is signed in with uid client: ", user.uid);
    } else {
        console.log("No user is signed in.");
        throw new Error("No user is signed in."); // Throw an error if no user is signed in
    }
  
    const storage = getStorage(app);
    const storageRef = ref(storage, destination);
  
    const uploadTask = uploadBytesResumable(storageRef, file);
  
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // console.log('Upload is ' + progress + '% done');
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
 * @param {string} filePath
 */
export async function deleteFileFromBucket(filePath: string): Promise<void> {
    const storage = getStorage(app);
    const fileRef = ref(storage, filePath);

    try {
        await deleteObject(fileRef);
        console.log('File successfully deleted.');
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error; // re-throw the error so it can be handled by the caller
    }
}