import { useParams } from 'react-router-dom'
import { SubNavigation } from '../../components/SubNavigation'
import { Mapping } from '../../components/Mapping'
import { Box, Flex, Breadcrumbs, Crumb, Link } from '@strapi/design-system'

const PageMapping = () => {

    const params = useParams()

    return (
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />
            <Box width="100%" padding={8} background="neutral100" overflow='hidden'>

                <Breadcrumbs label="Extra navigation">
                    <Crumb>
                        <Link to={`./`}>Mappings</Link>
                    </Crumb>
                    <Crumb>{ params.mappingId }</Crumb>
                    {/* isCurrent */}
                </Breadcrumbs>

                { params.mappingId && (
                    <Mapping mappingId={params.mappingId} />
                )}                    
            </Box>
        </Flex>
    )
}

export default PageMapping