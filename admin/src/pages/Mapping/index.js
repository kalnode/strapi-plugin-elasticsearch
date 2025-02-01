import React, { useState, useEffect } from 'react'
import { SubNavigation } from '../../components/SubNavigation'
import { Mapping } from '../../components/Mapping'
import { Box, Flex, Button, ModalLayout, ModalHeader, ModalFooter, ModalBody, Table, Thead, Tbody, Tr, Td, Th, TFooter, EmptyStateLayout, Checkbox, TextInput, IconButton, CaretDown } from '@strapi/design-system'
import { apiGetMapping } from '../../utils/apiUrls'
import axiosInstance  from '../../utils/axiosInstance'
import { Typography } from '@strapi/design-system'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { useParams } from 'react-router-dom'

const PageMapping = () => {

    const [isInProgress, setIsInProgress] = useState(false)
    const [mappingId, setMappingId] = useState(null)
    const [mapping, setMapping] = useState(null)
    const params = useParams()
    const showNotification = useNotification()
    
    useEffect( () => {
        if (params && params.mappingId) {
            setMappingId(params.mappingId)
        }
    }, [params])

    return (
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />
            <Flex direction="column" alignItems="start" gap={8} padding={8} background="neutral100" width="100%">
                {/* <Box>
                    <Typography variant="alpha">Mapping</Typography>
                </Box> */}
                <Box width="100%">
                    { mappingId && (
                        <Mapping mappingId={mappingId} />
                    )}
                    
                </Box>
            </Flex>
        </Flex>
    )
}

export default PageMapping