import React from 'react'
import { SubNavigation } from '../../components/SubNavigation'
import { Mappings } from '../../components/Mappings'
import { Flex, Grid, Box } from '@strapi/design-system'
import '../../styles/styles.css'

const PageMappings = () => {
    return (
        <Grid gap={4} alignItems="stretch" style={{ gridTemplateColumns: 'auto 1fr' }}>
            <SubNavigation />
            <Box padding={8} background="neutral100" overflow='hidden'>
                <Mappings />
            </Box>        
        </Grid>
    )
}

export default PageMappings
