import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "../local-storage/local-storage";
import { Table } from "../local-storage";
import { Parking, Perceptor, Tarification } from "../context/workSession";
import { usePersist } from "../local-storage/local-storage-2";


export const useWorkSession = () => {
    const [parkings, setParkings] = useState<Parking[]>();
    const [perceptors, setPerceptors] = useState<Perceptor[]>();
    const [tarifications, setTarifications] = useState<Tarification[]>();
    const {localStorage} = useLocalStorage();

    const { persist } = usePersist();

    const update = (data: { tarifications?: Tarification[], perceptors?: Perceptor[], parkings?: Parking[] }) => {
        if(data.tarifications) setTarifications(data.tarifications);
        if(data.perceptors) setPerceptors(data.perceptors);
        if(data.parkings) setParkings(data.parkings);
    };

    useEffect(() => {
        if(parkings) {
            persist<Parking[]>({ value: parkings ? parkings : [], table: Table.parking })
                .catch((error) => {
                    throw new Error('Impossible de persister les parkings')
                });
        }
    }, [parkings]);

    useEffect(() => {
        if(perceptors) {
            persist<Perceptor[]>({ value: perceptors ? perceptors : [], table: Table.perceptors })
                .catch((error) => {
                    throw new Error('Impossible de persister les percepteurs')
                });
        }
    }, [perceptors]);

    useEffect(() => {
        if(tarifications) {
            persist<Tarification[]>({ value: tarifications ? tarifications : [], table: Table.tarification })
                .catch((error) => {
                    throw new Error('Impossible de persister les tarifs')
                });
        }
    }, [tarifications]);

    useEffect(() => {
        // Recupération des données dans le local storage
        localStorage(Table.parking, true)
            .then((values: { id: string, name: string }[]) => {
                setParkings(values);
            })
            .catch(e => console.log('App component => ', e));

        localStorage(Table.perceptors, true)
            .then((values: Perceptor[]) => {
                setPerceptors(values);
            })
            .catch(e => console.log('App component => ', e));
        
        localStorage(Table.tarification, true)
            .then((values) => setTarifications(values))
            .catch((e) => console.log('Impossible de récuperer les tarifications'));
    }, []);

    return { tarifications, perceptors, parkings, update };
};
