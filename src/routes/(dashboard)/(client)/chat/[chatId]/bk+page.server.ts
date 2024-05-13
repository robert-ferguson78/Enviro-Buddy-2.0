export async function load({ params }) {
    // Assuming `chatId` is a route parameter
    const chatId = params.chatId;  // Get chatId from params

    // You can use this chatId to fetch related data or simply pass it
    return {
        props: {
            data: chatId  // Pass chatId as data
        }
    };
}