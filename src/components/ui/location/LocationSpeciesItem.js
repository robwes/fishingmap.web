import React from 'react';
import LinkItem from '../linkItem/LinkItem';

function LocationSpeciesItem({ species }) {
    return (
        <LinkItem
            item={{
                icon: "fa-solid fa-fish",
                text: species.name,
            }}
        />
    )
}

export default LocationSpeciesItem