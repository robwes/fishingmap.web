import React from 'react';
import LinkItem from '../../../components/ui/linkItem/LinkItem';

function LocationPermitItem({ permit }) {
    return (
        <LinkItem item={{
            icon: "fa-solid fa-file-lines",
            text: permit.name,
        }} />
    )
}

export default LocationPermitItem