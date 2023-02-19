export async function wait(ms: number): Promise<any> { 
    
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({})
        },ms)
    })

}