import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { SubNavigation } from '../../components/SubNavigation'
import { Index } from '../../components/Index'
import { Box, Flex } from '@strapi/design-system'

const PageIndex = () => {

    const [indexId, setIndexId] = useState(null)
    const params = useParams()
    
    useEffect( () => {
        if (params && params.indexId) {
            setIndexId(params.indexId)
        }
    }, [params])

    return (
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />
            <Box width="100%" padding={8}>
                { indexId && (
                    <Index indexId={indexId} />
                )}
            </Box>
        </Flex>
    )
}

export default PageIndex