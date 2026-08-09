import React from 'react';
import Collapse from '@/shared/components/collapse/Collapse';
import ImageCarousell from '@/shared/components/imageCarousell/ImageCarousell';
import SpeciesRuleRow from '@/features/locations/components/SpeciesRuleRow';
import RegionChainNote from '@/features/locations/components/RegionChainNote';
import LocationPermitItem from './LocationPermitItem';
import useRegions from '@/shared/hooks/useRegions';
import { buildRegionChain } from '@/shared/utils/regulationUtils';
import CollapsibleArticlePrimary from '@/features/locations/components/CollapsibleArticlePrimary';
import lake from '@/assets/images/lake.png';
import { fileService } from '@/shared/services/fileService';
import './LocationCard.scss';

function LocationCard({ location }) {

    // The location carries its own region but not its ancestors, so the
    // inheritance chain has to be assembled from the full region list.
    const { regions } = useRegions();
    const regionChain = buildRegionChain(regions, location.region?.id);

    const getImages = () => {
        const images = [];

        if (location && location.images.length > 0) {
            location.images.forEach(image => {
                images.push({
                    url: fileService.getImageUrl(image.path),
                    description: location.name
                });
            });
        } else {
            images.push({
                url: lake,
                description: "Default location image"
            });
        }

        return images;
    }

    /**
     * Pairs each species with the rule that actually applies to it here.
     * `speciesRules` holds one resolved rule per species, but only for species
     * that have one — a water can list a fish with no regulation at all.
     */
    const getSpeciesRules = () => {
        const rules = location.speciesRules ?? [];

        return location.species.map(s => (
            <SpeciesRuleRow
                key={s.id}
                species={s}
                rule={rules.find(r => r.speciesId === s.id)}
            />
        ));
    }

    const getPermits = () => {
        return location.permits.map(p => (
            <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer">
                <LocationPermitItem
                    permit={p}
                />
            </a>
        ));
    }

    return (
        <div className="location-card">
            <ImageCarousell images={getImages()} className="location-card-image" />
            <h3 className='location-card-title'>
                {location.name}
            </h3>
            <div className="location-card-body">

                <Collapse label="Species &amp; rules" open={true}>
                    <ul className="species-rule-list">
                        {getSpeciesRules()}
                    </ul>
                    <RegionChainNote regions={regionChain} />
                </Collapse>

                <Collapse label="Permits" open={true}>
                    <div className='location-permit-list'>
                        {getPermits()}
                    </div>
                </Collapse>
            </div>
            <CollapsibleArticlePrimary
                className="location-card-footer"
                title="Rules"
                text={location?.rules}
            />
        </div>
    )
}

export default LocationCard
