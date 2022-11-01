import React from 'react';
import LinkItem from './LinkItem';

function LinkItemList({items, isLink = true}) {
    return (
        <div className="link-item-list">
            {items.map(item => ( 
                <LinkItem 
                    key={item.path}
                    icon={item.icon}
                    text={item.text}
                    path={item.path}
                    isLink={isLink}
                />
            ))}
        </div>
    )
}

export default LinkItemList;
