import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { SubNavigation } from '../../components/SubNavigation'
import { Mapping } from '../../components/Mapping'
import { Box, Flex, Breadcrumbs, Crumb, Link } from '@strapi/design-system'
import pluginId from '../../pluginId'

const PageIndexMapping = () => {

    const params = useParams()
    const [indexId, setIndexId] = useState(null)
    const [mappingId, setMappingId] = useState(null)
    
    useEffect( () => {
        console.log("IndexMapping mounted 111")
        if (params && params.mappingId && params.indexId) {
            console.log("IndexMapping mounted 222")
            setMappingId(params.mappingId)
            setIndexId(params.indexId)
        }
    }, [params])

    return (
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />
            <Box width="100%" padding={8} background="neutral100" overflow='hidden'>

                <Breadcrumbs label="Extra navigation">
                    <Crumb><Link to={`/plugins/${pluginId}/indexes`}>Indexes</Link></Crumb>
                    <Crumb><Link to={`/plugins/${pluginId}/indexes/${indexId}`}>{indexId}</Link></Crumb>
                    <Crumb><Link to={`/plugins/${pluginId}/indexes/${indexId}/Mappings`}>Mappings</Link></Crumb>
                    <Crumb>{ mappingId }</Crumb>
                    {/* isCurrent */}
                </Breadcrumbs>

                { mappingId && (
                    <Mapping mappingId={mappingId} />
                )}

            </Box>
        </Flex>
    )
}

export default PageIndexMapping