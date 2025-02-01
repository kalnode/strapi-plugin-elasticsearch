import React from 'react'
import { SubNavigation } from '../../components/SubNavigation'
import { ComponentIndexes } from '../../components/Indexes' // TODO: For some reason, "Indexes" as component name fails, but "ComponentIndexes" works.
import { Grid, Box } from '@strapi/design-system'
import '../../styles/styles.css'

const PageIndexes = () => {
    return (
        <Grid gap={4} alignItems="stretch" style={{ gridTemplateColumns: 'auto 1fr' }}>
            <SubNavigation />       
            <Box padding={8} background="neutral100" overflow='hidden'>
                <ComponentIndexes />
            </Box>        
        </Grid>
    )
}

export default PageIndexes
