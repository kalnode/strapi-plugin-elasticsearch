import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { SubNavigation } from '../../components/SubNavigation'
import { Grid, Box, Breadcrumbs, Crumb, Link } from '@strapi/design-system'
import { Mappings } from '../../components/Mappings'
import pluginId from '../../pluginId'

const PageIndexMappings = () => {

    const [indexId, setIndexId] = useState(null)
    const params = useParams()
    
    useEffect( () => {
        if (params && params.indexId) {
            setIndexId(params.indexId)
        }
    }, [params])

    return (
        <Grid gap={4} alignItems="stretch" style={{ gridTemplateColumns: 'auto 1fr' }}>
            <SubNavigation />
            
            { indexId && (
                <Box padding={8} background="neutral100" overflow='hidden'>
                    
                    <Breadcrumbs label="Extra navigation">
                        <Crumb><Link to={`/plugins/${pluginId}/indexes`}>Indexes</Link></Crumb>
                        <Crumb><Link to={`/plugins/${pluginId}/indexes/${indexId}`}>{indexId}</Link></Crumb>
                        <Crumb>Mappings</Crumb>
                        {/* isCurrent */}
                    </Breadcrumbs>

                    <Box width='100%' overflow='hidden'>
                        <Mappings indexId={indexId} />
                    </Box>

                </Box>
            )}
        </Grid>
    )
}

export default PageIndexMappings