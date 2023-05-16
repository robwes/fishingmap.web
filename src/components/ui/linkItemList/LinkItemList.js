import React from 'react';
import LinkItem from './LinkItem';
import './LinkItemList.scss';

function LinkItemList({items}) {
    return (
        <div className="link-item-list">
            {items.map(item => ( 
                <LinkItem 
                    key={item.path}
                    item={item}
                />
            ))}
        </div>
    )
}

export default LinkItemList;
