
export function getCollection({ name, data } : { name: string, data: any }) : any[]
{
    let collection = data ? data[name] : null;
    if(collection) 
        return collection.edges?.map( ({node} : {node : any}) => ({...node}));
    
    return [];
}

export function dataFromMutation({ mutationName, objectName, response }: { mutationName: string, objectName: string, response: any }): Object
{
    let object = response?.data 
                    ? (response.data[mutationName] 
                        ? (response.data[mutationName][objectName] ? response.data[mutationName][objectName] : null ) 
                        : null)
                    : null;
    
    return object;
}