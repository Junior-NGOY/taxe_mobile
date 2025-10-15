import * as React from 'react';
//import { View } from 'react-native';
import { View } from './Themed';

/**
 * Génération d'une ligne de la grille
 */
function lines(column: number, items: Array<JSX.Element> ) {
    let length = items.length;
    let component : JSX.Element[] = [];
        for(let position = 0; position < length ; position = position + column) {
            component.push(
                <View key={'line-'+ position} style={{ flexDirection: 'row', marginHorizontal: 1 }}>
                    {cellules(position, column, items)}
                </View>
            );
        }

    return (<View>{component}</View>);
}

/**
 * Génération de chaque cellule d'une ligne
 */
function cellules(position: number, column : number, items: Array<any>) {
    let children = [];
    let limit = position + column;
    let length = items.length;
    for(let i = position; i < length && i < limit; i++) {
        children.push(<View key={'cell-'+ i} style={{flex: 1, margin: 2}}>{items[i]}</View>);
    }

    if(limit > length) {
        for(let i = length; i < limit; i++) {
            children.push(<View key={'cell-extra-'+ i} style={{flex: 1, margin: 2}}></View>);
        }
    }

    return children;
}

const Grid = ({column, children, ...props} : { column: number, children: JSX.Element | JSX.Element[]} ) => {
    return (
        <View {...props}>
            {
                Array.isArray(children) 
                    ? lines(column, children) 
                    : children
            }
        </View>
    );
};

export default Grid;
