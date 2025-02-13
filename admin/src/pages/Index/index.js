import { useParams } from 'react-router-dom'
import { SubNavigation } from '../../components/SubNavigation'
import { Index } from '../../components/Index'
import { Grid, Box, Breadcrumbs, Crumb, Link } from '@strapi/design-system'

const PageIndex = () => {

    const params = useParams()

    return (
        <Grid gap={4} alignItems="stretch" style={{ gridTemplateColumns: 'auto 1fr' }}>
            <SubNavigation />

            { params.indexId && (
                <Box padding={8} background="neutral100" overflow='hidden'>

                    <Breadcrumbs label="Extra navigation">
                        <Crumb>
                            <Link to={`./`}>Indexes</Link>
                        </Crumb>
                        <Crumb>{params.indexId}</Crumb>
                        {/* isCurrent */}
                    </Breadcrumbs>

                    <Index indexId={params.indexId} />

                </Box>
            )}
        </Grid>
    )
}

export default PageIndex