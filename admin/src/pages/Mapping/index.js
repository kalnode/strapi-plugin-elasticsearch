import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { SubNavigation } from '../../components/SubNavigation'
import { Mapping } from '../../components/Mapping'
import { Box, Flex } from '@strapi/design-system'

const PageMapping = () => {

    const [mappingId, setMappingId] = useState(null)
    const params = useParams()
    
    useEffect( () => {
        if (params && params.mappingId) {
            setMappingId(params.mappingId)
        }
    }, [params])

    return (
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />
            <Box width="100%" padding={8}>
                { mappingId && (
                    <Mapping mappingId={mappingId} />
                )}                    
            </Box>
        </Flex>
    )
}

export default PageMapping