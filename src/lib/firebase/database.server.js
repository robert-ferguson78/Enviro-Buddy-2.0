// import { db } from '$lib/firebase/firebase.server';

// export async function addUserDetails(formData, userId) {
//     const userRef = await db.collection('users').doc(uid)
//     // Update the document with the new name and brand
//     await userRef.update({
//         name: name,
//         brand: brand
//     });

//     // Get the updated document
//     const doc = await userRef.get();

//     // Return the updated user
//     return { _id: doc.id, ...doc.data() };
// }