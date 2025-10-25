// Import the Pinecone library
const { Pinecone } =require('@pinecone-database/pinecone')

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey:process.env.PINECONE_API });

const cohortChatGptIndex=pc.index('cohort-chat-gpt')

async function createMemory({vectors,metadata,messageID}) {
    
    await cohortChatGptIndex.upsert([{
        id: messageID,
        values: vectors, // must be array of numbers
        metadata
    }]);
}
async function queryMemory({queryVector,limit=5,metadata}) {
    const data=await cohortChatGptIndex.query({
       vector:queryVector,
       topK:limit,
       filter:metadata?{metadata}:undefined , 
       includeMetadata:true
    })
    return data.matches[0].values
}

module.exports={
    createMemory,
    queryMemory
}