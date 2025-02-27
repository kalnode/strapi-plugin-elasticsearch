/**
 *
 * PAGE: Index mappings
 * View/edit mappings associated with a registered index
 * 
 */

import { useParams } from 'react-router-dom'
import { SubNavigation } from '../../components/SubNavigation'
import { Grid, Box, Breadcrumbs, Crumb, Link } from '@strapi/design-system'
import { Mappings } from '../../components/Mappings'
import { TriggersMappings } from '../../components/IndexMappings'
import pluginId from '../../pluginId'

const PageIndexMappingsNew = () => {

    const params = useParams<{ indexUUID: string }>()

    return (
        <Grid gap={4} alignItems="stretch" style={{ gridTemplateColumns: 'auto 1fr' }}>
            <SubNavigation />
            
            { params.indexUUID && (
                <Box padding={8} background="neutral100" overflow='hidden'>
                    
                    <Breadcrumbs label="Extra navigation">
                        <Crumb><Link to={`/plugins/${pluginId}/indexes`}>Indexes</Link></Crumb>
                        <Crumb><Link to={`/plugins/${pluginId}/indexes/${params.indexUUID}`}>{params.indexUUID}</Link></Crumb>
                        <Crumb>Mappings</Crumb>
                        {/* isCurrent */}
                    </Breadcrumbs>

                    <Box width='100%' overflow='hidden'>
                        {/* <Mappings indexUUID={params.indexUUID} /> */}
                        <TriggersMappings indexUUID={params.indexUUID} />
                        
                    </Box>

                </Box>
            )}
        </Grid>
    )
}

export default PageIndexMappingsNew