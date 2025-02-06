import React from 'react'
import { useParams } from 'react-router-dom'
import { SubNavigation } from '../../components/SubNavigation'
import { Mapping } from '../../components/Mapping'
import { Box, Flex, Breadcrumbs, Crumb, Link } from '@strapi/design-system'
import pluginId from '../../pluginId'

const PageIndexMapping = () => {

    const params = useParams()

    return (
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />
            <Box width="100%" padding={8} background="neutral100" overflow='hidden'>

                <Breadcrumbs label="Extra navigation">
                    <Crumb><Link to={`/plugins/${pluginId}/indexes`}>Indexes</Link></Crumb>
                    <Crumb><Link to={`/plugins/${pluginId}/indexes/${params.indexId}`}>{params.indexId}</Link></Crumb>
                    <Crumb><Link to={`/plugins/${pluginId}/indexes/${params.indexId}/mappings`}>Mappings</Link></Crumb>
                    <Crumb>{ params.mappingId }</Crumb>
                    {/* isCurrent */}
                </Breadcrumbs>

                <Mapping mappingId={params.mappingId} indexId={params.indexId} />

            </Box>
        </Flex>
    )
}

export default PageIndexMapping