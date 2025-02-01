/**
 *
 * Mappings component
 *
 */

import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import pluginId from '../../pluginId'
import { Box, Flex, Button, ModalLayout, ModalHeader, ModalFooter, ModalBody, Table, Thead, Tbody, Tr, Td, Th, TFooter, EmptyStateLayout, Checkbox, TextInput, IconButton, CaretDown, Typography } from '@strapi/design-system'
import { Pencil, Trash, Refresh, Plus } from '@strapi/icons'
import { apiGetMapping, apiGetMappings, apiCreateMapping, apiUpdateMapping, apiDeleteMapping, apiGetContentTypes } from '../../utils/apiUrls'
import axiosInstance  from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { useParams, useHistory } from 'react-router-dom';

export const Mappings = ({ indexId }) => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState(false)
    const [mappings, setMappings] = useState(null)
    const history = useHistory()
    const showNotification = useNotification()

    useEffect(() => {
        requestGetMappings()
    }, [])

    const requestGetMappings = () => {
        setIsInProgress(true)
        console.log("Mappings component requestGetMappings: ", indexId)
        axiosInstance.get(apiGetMappings(indexId))
            .then((response) => {
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    setMappings(response.data)
                } else {
                    setMappings(null)
                }
            })
            .catch((error) => {
                console.log("PAGE MAPPINGS - requestGetMappings ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
    }

    // ===============================
    // CREATE NEW MAPPING
    // ===============================
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedType, setSelectedType] = useState(null)
    const [contentTypes, setContentTypes] = useState(null)

    const getContentTypes = () => {
        setIsInProgress(true)
        return axiosInstance.get(apiGetContentTypes)
            .then((response) => {
                setContentTypes(response.data)
            })
            .catch((error) => {
                console.log("PAGE MAPPINGS - getContentTypes ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
    }

    const modalCreateMappingOpen = async () => {
        setSelectedType(null)
        await getContentTypes()
        setShowCreateModal(true)
    }

    const modalCreateMappingClose = async (reload) => {
        setSelectedType(null)
        setShowCreateModal(false)
        console.log("modalCreateMappingClose 112233 ", reload)
        if (reload) {
            requestGetMappings()
        }
    }

    const requestDeleteMapping = (e, mappingIDNumber) => {
        e.stopPropagation()
        setIsInProgress(true)
        return axiosInstance.get(apiDeleteMapping(mappingIDNumber))
        .then((response) => {
            console.log("Delete response is: ", response)
        })
        .catch((error) => {
            console.log("PAGE MAPPINGS - requestDeleteMapping ERROR: ", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            requestGetMappings()
        })
    }



    return  (

        <Flex width="100%" direction="column" alignItems="start" gap={2} background="neutral100">
           
            <Box>
                <Typography variant="alpha">Mappings</Typography>
            </Box>

            <Box>
                <Flex gap={4}>
                    {/* <Typography variant="delta">Actions</Typography>
                    <Button loading={isInProgress} fullWidth variant="secondary" onClick={requestGetMappings}>Reload list</Button> */}
                    <IconButton onClick={requestGetMappings} label="Get mappings" icon={<Refresh />} />
                    <Button loading={isInProgress} fullWidth variant="secondary" onClick={modalCreateMappingOpen} style={{ whiteSpace: 'no-wrap' }} startIcon={<Plus />}>
                        Create Preset Mapping
                    </Button>
                </Flex>
            </Box>

            <Box width="100%" style={{ overflow: 'hidden' }}>
                { !mappings || (mappings && mappings.length === 0) && (
                    <EmptyStateLayout icon={<Cross />} content="You don't have any content yet..." action={
                        <Button variant="secondary" startIcon={<Plus />} style={{ whiteSpace: 'no-wrap' }}>
                            Create a preset mapping
                        </Button>
                    } />
                ) }

                { mappings && Array.isArray(mappings) && mappings.length > 0 && (
                    <>
                        <Table colCount={7} rowCount={mappings.length} width="100%" tableLayout='auto'>
                        {/* footer={<TFooter icon={<Plus />}>Add another field to this collection type</TFooter>} */}
                            <Thead>
                                <Tr>
                                    <Th>
                                        <Checkbox aria-label="Select all entries" className="checkbox" />
                                    </Th>
                                    <Th>
                                        <Typography variant="sigma">Post Type</Typography>
                                    </Th>
                                    <Th>
                                        <Typography variant="sigma">Mapping</Typography>
                                    </Th>
                                    <Th>
                                        <Typography variant="sigma">Preset</Typography>
                                    </Th>
                                    <Th>
                                        <Typography variant="sigma">Nested Level</Typography>
                                    </Th>
                                    <Th>
                                        <Typography variant="sigma">Index Name</Typography>
                                    </Th>
                                    <Th>
                                        <Typography variant="sigma">Default</Typography>
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                            { mappings.map((data, index) => {
                                return (
                                    <Tr key={index} className="row" onClick={() => history.push(`/plugins/${pluginId}/mapping/${data.id}`)}>
                                        <Td>
                                            <Checkbox aria-label={`Select ${data.id}`} className="checkbox" />
                                        </Td>
                                        <Td style={{ overflow: 'hidden' }}>
                                            <Typography textColor="neutral600">{data.post_type}</Typography>
                                        </Td>
                                        <Td style={{ overflow: 'hidden', maxWidth: '200px' }}>
                                            <Typography textColor="neutral600">{data.mapping}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{data.preset}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{data.nested_level}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{data.registered_index}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{data.default_preset}</Typography>
                                        </Td>
                                        <Td>
                                            <Flex alignItems="end" gap={2}>
                                                {/* <IconButton onClick={(e) => editMapping(data.id)} label="Edit" borderWidth={0}>
                                                    <Pencil />
                                                </IconButton> */}
                                                <IconButton label="Edit mapping" noBorder icon={<Pencil />} />
                                                {/* onClick={() => history.push(`/plugins/${pluginId}/mapping/${data.id}`)} */}

                                                <IconButton onClick={(e) => requestDeleteMapping(e, data.id)} label="Delete" borderWidth={0} icon={<Trash />} />
                                            </Flex>
                                        </Td>
                                    </Tr>
                                )
                            }) }
                            </Tbody>
                        </Table>
                        <Box paddingTop={2} paddingBottom={2}>
                            <Typography textColor="neutral600">This view lists mappings (in the context of this plugin).</Typography>
                        </Box>
                    </>
                ) }
            </Box>

            { showCreateModal && (
                <ModalLayout onClose={() => modalCreateMappingClose()}>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Create preset mapping
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Box width="100%">
                            { !contentTypes || (contentTypes && Object.values(contentTypes).length === 0) && ( <> No content types found </> ) }

                            { contentTypes && Object.values(contentTypes).length > 0 && (
                                <>
                                    { !selectedType && (
                                        <>                                                
                                            <Table colCount={3} rowCount={mappings.length} width="100%">
                                            {/* footer={<TFooter icon={<Plus />}>Add another field to this collection type</TFooter>} */}
                                                <Thead>
                                                    <Tr>
                                                        <Th>
                                                            <Typography variant="sigma">Name</Typography>
                                                        </Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                { Object.keys(contentTypes).map((key, index) => {
                                                    return (
                                                        <Tr key={index}>
                                                            <Td>
                                                                <Typography textColor="neutral600">{key}</Typography>
                                                            </Td>
                                                            <Td>
                                                                <Button onClick={() => setSelectedType(key)}>Use Type</Button>
                                                            </Td>
                                                        </Tr>
                                                    )
                                                }) }
                                                </Tbody>
                                            </Table>
                                            <Box paddingTop={2} paddingBottom={2}>
                                                <Typography textColor="neutral600">This view lists approved content types for mapping.</Typography>
                                            </Box>
                                        </>
                                    ) }

                                    { selectedType && (
                                        <>
                                            <Mapping posttype={selectedType} closeEvent={(e) => modalCreateMappingClose(e)} />
                                        </>
                                    )}
                                </>
                            ) }
                        </Box>
                        
                    </ModalBody>

                    {/* <ModalFooter
                        startActions={
                            <Button onClick={() => console.log("Click!! 32324")} variant="tertiary">
                                Cancel
                            </Button>
                        }
                        endActions={
                            <>
                            <Button loading={isInProgress} onClick={() => console.log("Click!! 35fffff")}>
                                Import
                            </Button>
                            </>
                        }
                    /> */}
                    
                </ModalLayout>

            ) }

        </Flex>
    )
}