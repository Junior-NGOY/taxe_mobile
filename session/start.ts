import { useContext, useState } from "react"
import { Parking, Perceptor, WorkSessionContext } from "../context/workSession";
import { SessionContext } from "./context";
import { FeedBackContext } from "../feedback/context";

export const useStart = () => {
    const [loading, setLoading] = useState(false);
    const { parkings, perceptors } = useContext(WorkSessionContext);
    const { session, create, close } = useContext(SessionContext);
    const { invoices } = useContext(WorkSessionContext);
    // const { synchronise } = useContext(SessionContext);
    const { communicate } = useContext(FeedBackContext);

    const start = (data : { parking: number|string, perceptor: number|string, printingLimit: number }) => {
        setLoading(true);
        let perceptor: Perceptor|undefined = perceptors?.filter(item => item.id == data.perceptor).find(item => Boolean(item));
        let parking: Parking|undefined = parkings?.filter(item => item.id == data.parking).find(item => Boolean(item));
        if(!perceptor) {
            communicate({ content: 'Veuillez sélectionner un percepteur', duration: 5000});
        } else if(!parking) {
            communicate({ content: 'Veuillez sélectionner un parking', duration: 5000 });
        } else if(!session) {
            create({
                parking,
                account: perceptor,
                startAt: new Date(),
                printingLimit: data.printingLimit
            });
        } else if(session) {
            create({...session, parking, account: perceptor, printingLimit: data.printingLimit });
        }

        setLoading(false);
    };

    const remove = async () => {
        setLoading(true);
        if(invoices.length === 0) {
            close();
            // synchronise();
            communicate({ content: 'Session redemarée', duration: 5000});
        } else {
            communicate({ content: "La session contient des informations, veuillez d'abord la cloturer", duration: 5000 });
        }
        setLoading(false);
    }

    return { start, loading, remove };
}