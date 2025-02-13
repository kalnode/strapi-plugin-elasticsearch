import { useParams } from 'react-router-dom'
import { SubNavigation } from '../../components/SubNavigation'
import { Grid, Box, Breadcrumbs, Crumb, Link } from '@strapi/design-system'
import { Mappings } from '../../components/Mappings'
import pluginId from '../../pluginId'

const PageIndexMappings = () => {

    const params = useParams()

    return (
        <Grid gap={4} alignItems="stretch" style={{ gridTemplateColumns: 'auto 1fr' }}>
            <SubNavigation />
            
            { params.indexId && (
                <Box padding={8} background="neutral100" overflow='hidden'>
                    
                    <Breadcrumbs label="Extra navigation">
                        <Crumb><Link to={`/plugins/${pluginId}/indexes`}>Indexes</Link></Crumb>
                        <Crumb><Link to={`/plugins/${pluginId}/indexes/${params.indexId}`}>{params.indexId}</Link></Crumb>
                        <Crumb>Mappings</Crumb>
                        {/* isCurrent */}
                    </Breadcrumbs>

                    <Box width='100%' overflow='hidden'>
                        <Mappings indexId={params.indexId} />
                    </Box>

                </Box>
            )}
        </Grid>
    )
}

export default PageIndexMappings