import { doc, getDoc, collection, updateDoc, query, where, getDocs, deleteDoc, addDoc } from "firebase/firestore";
import { db } from '$lib/firebase/firebase.client';
import { saveFileToBucket, deleteFileFromBucket } from '$lib/firebase/firestorage.client';

const collectionName = "carTypes";
const carTypesRef = collection(db, collectionName);

// Define the Firestore store for car types
export const carTypeFirestoreStore = {
    // Method to find all car types
    async findCarType() {
        // Get a snapshot of the 'carTypes' collection
        const snapshot = await getDocs(carTypesRef);
        // Map over the documents in the snapshot and return an array of car types
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Method to find a car type by ID
    async findByIdCarType(id) {
        // Get the document with the given ID
        const docSnap = await getDoc(doc(db, collectionName, id));
        // If the document exists, return the car type, otherwise return null
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    },

    // Method to get car types by brand ID
    async getCarTypesByBrandId(userId) {
        // Get a snapshot of the documents where 'userId' is equal to 'brandId'
        const q = query(carTypesRef, where("userId", "==", userId));
        const snapshot = await getDocs(q);
        // Map over the documents in the snapshot and return an array of car types
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Method to get all car body types
    async getAllCarBodyTypes() {
        // Get a snapshot of the 'carTypes' collection
        const snapshot = await getDocs(carTypesRef);
        // Map over the documents in the snapshot to get an array of car types
        const carTypes = snapshot.docs.map(doc => doc.data());
        // Create a Set from the 'carType' property of each car type to remove duplicates, then convert back to an array
        const carBodyTypes = [...new Set(carTypes.map(carType => carType.carType))];
        // Return the array of unique car body types
        return carBodyTypes;
    },

    // Method to create a new car type
    // Method to create a new car type
async createCarType(carType) {
    // console.log('createCarType', carType);
    // If there's an image, upload it and replace the image property with the URL
    if (carType.image) {
        try {
            carType.image = await uploadImage(carType.image);
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error; // re-throw the error so it can be handled by the caller
        }
    }

        // If there are additional images, upload them and replace the additionalImages property with the URLs
        if (carType.additionalImages && carType.additionalImages.length > 0) {
            try {
                const additionalImageUrls = [];
                for (const image of carType.additionalImages) {
                    const imageUrl = await uploadImage(image);
                    additionalImageUrls.push(imageUrl);
                }
                carType.additionalImages = additionalImageUrls;
            } catch (error) {
                console.error('Error uploading additional images:', error);
                throw error; // re-throw the error so it can be handled by the caller
            }
        }

        // Add a new document to the 'carTypes' collection with the given car type
        const docRef = await addDoc(carTypesRef, carType);
        // Update the document to include its ID as a field
        await updateDoc(docRef, { id: docRef.id });
        // Return the new car type with its ID
        return { id: docRef.id, ...carType };
    },

    // Method to update a car type
    async updateCarType(id, updatedCarType, imageFiles, additionalImageFiles) {
        console.log('imageFiles:', imageFiles); // Add this line
        // Get the document with the given ID
        const docSnap = await getDoc(doc(db, collectionName, id));
        // If the document does not exist, throw an error
        if (!docSnap.exists()) {
            throw new Error("CarType not found");
        }

        // Function to upload an image file and return the URL
        const uploadImage = async (imageFile) => {
            if (!imageFile || !imageFile.name) {
                throw new Error('Invalid image file');
            }
        
            // Get the current timestamp
            const timestamp = Date.now();
            // Get the file extension
            const extension = imageFile.name.split('.').pop();
            // Get the filename without the extension
            const filename = imageFile.name.substring(0, imageFile.name.length - extension.length - 1);
            // Create a new filename with the timestamp
            const newFilename = `${filename}-${timestamp}.${extension}`;
        
            const destination = `images/${newFilename}`;
            const imageUrl = await saveFileToBucket(imageFile, destination);
            return imageUrl;
        };

        // If there is a main image file, upload it and replace the image property with the URL
        if (imageFiles && imageFiles.length > 0) {
            try {
                const imageUrl = await uploadImage(imageFiles[0]);
                updatedCarType.image = imageUrl;
            } catch (error) {
                console.error('Error uploading main image:', error);
                throw error; // re-throw the error so it can be handled by the caller
            }
        }

        // If there are additional image files, upload them and replace the additionalImages property with the URLs
        if (additionalImageFiles && additionalImageFiles.length > 0) {
            try {
                const additionalImageUrls = await Promise.all(additionalImageFiles.map(uploadImage));
                updatedCarType.additionalImages = additionalImageUrls;
            } catch (error) {
                console.error('Error uploading additional images:', error);
                throw error; // re-throw the error so it can be handled by the caller
            }
        }

        // Update the document in the Firestore database
        await updateDoc(doc(db, collectionName, id), updatedCarType);
    },

    async deleteCarTypeById(id) {
        // Get the document with the given ID
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
    
        // If the document does not exist, throw an error
        if (!docSnap.exists()) {
            throw new Error("CarType not found");
        }
    
        // Get the car type data
        const carType = docSnap.data();
    
        // If there's an image, delete it
        if (carType.image) {
            try {
                await deleteFileFromBucket(carType.image);
            } catch (error) {
                console.error('Error deleting image:', error);
                throw error; // re-throw the error so it can be handled by the caller
            }
        }
    
        // Delete the document
        await deleteDoc(docRef);
    }
};

 // Helper function to upload an image and return its URL
 async function uploadImage(image) {
    // Get the current timestamp
    const timestamp = Date.now();
    // Get the file extension
    const extension = image.name.split('.').pop();
    // Get the filename without the extension
    const filename = image.name.substring(0, image.name.length - extension.length - 1);
    // Create a new filename with the timestamp
    const newFilename = `${filename}-${timestamp}.${extension}`;

    const destination = `images/${newFilename}`;
    return await saveFileToBucket(image, destination);
}