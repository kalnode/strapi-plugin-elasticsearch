/**
 *
 * Mappings component
 *
 */

import { useEffect, useRef, useState } from 'react'
import pluginId from '../../pluginId'
import { Box, Flex, Button, ModalLayout, ModalHeader, Link, ModalFooter, ModalBody, Table, Thead, Tbody, Tr, Td, Th, TFooter, EmptyStateLayout, Checkbox, TextInput, IconButton, CaretDown, Typography } from '@strapi/design-system'
import { Pencil, Trash, Refresh, Plus, Cross } from '@strapi/icons'
import { apiGetMappings, apiDeleteMapping } from '../../utils/apiUrls'
import axiosInstance  from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { useParams, useHistory } from 'react-router-dom'
import { requestUpdateIndex } from '../../utils/api/indexAPI'

export const Mappings = ({ indexId, showOnlyPresets, modeOnlySelection, mappingHasBeenSelected }) => {

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

        axiosInstance.get(apiGetMappings(indexId))
            .then((response) => {
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {

                    // TODO: Legacy idea here of "preset", however if mappings are not binded to indexes, then they're _all_ presets, in theory.
                    // Keeping for now.
                    if (showOnlyPresets) {
                        setMappings(response.data.filter( (x) => x.preset))
                    } else {
                        setMappings(response.data)
                    }

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

    const requestDeleteMapping = (e, mappingID) => {
        e.stopPropagation()
        setIsInProgress(true)

        // TODO: Determine if mapping is preset or actual
        // If preset, just remove it, not delete

        // TODO: Should we do this by UUID? Anything wrong with doing it by id?
        let mapping = mappings.find( (x) => x.id === mappingID)

        // TODO: Add warning to user that they are attempting to delete a preset, which may be associated with another registered index
        if (mapping.preset) {
            console.log("Attempting to remove preset mapping from index")
        }
        
        return axiosInstance.get(apiDeleteMapping(mappingID))
        // .then((response) => {
        //     console.log("Delete response is: ", response)
        // })
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

    const requestEditMapping = (e, mappingId) => {
        e.stopPropagation()
        if (indexId) {
            history.push(`/plugins/${pluginId}/${indexId}/mappings/${mappingId}`)
        } else {
            history.push(`/plugins/${pluginId}/mappings/${mappingId}`)
        }
    }

    const requestGoToIndex = (e, reqIndexId) => {
        e.stopPropagation()
        if (reqIndexId) {
            history.push(`/plugins/${pluginId}/indexes/${reqIndexId}`)
        }
    }

    const handleRowClick = (mappingId) => {
        if (modeOnlySelection) {
            mappingHasBeenSelected(mappingId)
        } else {
            if (indexId) {
                history.push(`/plugins/${pluginId}/indexes/${indexId}/mappings/${mappingId}`)
            } else {
                history.push(`/plugins/${pluginId}/mappings/${mappingId}`)
            }
        }
    }

    // ===============================
    // SELECT MAPPING
    // ===============================
    const [showSelectModal, setShowSelectModal] = useState(false)

    const modalSelectPresetMappingOpen = async () => {
        setShowSelectModal(true)
    }

    const modalSelectPresetMappingClose = async (selectedPreset) => {
        setShowSelectModal(false)
        if (selectedPreset) {
            console.log("modalSelectPresetMappingClose 111", indexId)
            //index.mappings = [...index.mappings, selectedPreset]
            console.log("modalSelectPresetMappingClose 222", selectedPreset)

            let payload = {}
            console.log("modalSelectPresetMappingClose 333", mappings)
            if (mappings) {
                console.log("modalSelectPresetMappingClose 444", mappings)
                payload.mappings = [...mappings, selectedPreset]
            } else {
                console.log("modalSelectPresetMappingClose 555", mappings)
                payload.mappings = [selectedPreset]
            }
            console.log("modalSelectPresetMappingClose 666", mappings)
            console.log("modalSelectPresetMappingClose 777 is: ", payload)
            await requestUpdateIndex(indexId, payload)
            requestGetMappings()
        }
    }

    return  (

        <Flex width="100%" direction="column" alignItems="start" gap={2} background="neutral100">
           
            <Box>
                <Typography variant="alpha">{ showOnlyPresets ? 'Preset Mappings' : 'Mappings'}</Typography>
            </Box>

            { !modeOnlySelection && (
                <Flex width="100%" gap={4} justifyContent="space-between">
                    {/* <Typography variant="delta">Actions</Typography>
                    <Button loading={isInProgress} fullWidth variant="secondary" onClick={requestGetMappings}>Reload list</Button> */}

                    <Box>
                        {/* <IconButton onClick={ () => requestGetMappings() } label="Get mappings" icon={<Refresh />} /> */}
                    </Box>
                    
                    <Flex gap={4}>
                        { indexId && (
                            <Link to={`/plugins/${pluginId}/indexes/${indexId}/mappings/new`}>
                                <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                    Create Mapping
                                </Button>
                            </Link>
                        )}
                        { !indexId && (
                            <Link to={`/plugins/${pluginId}/mappings/new`}>
                                <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                    Create Preset Mapping
                                </Button>
                            </Link>
                        )}
                        { indexId && (
                            <Button loading={isInProgress} variant="secondary"
                            onClick={ () => modalSelectPresetMappingOpen() } style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                Add Preset Mapping
                            </Button>
                        )}
                    </Flex>
                </Flex>
            )}


            {/* ===================================== */}
            {/* ======== MAIN CONTENT =============== */}
            {/* ===================================== */}

            <Box width="100%" style={{ overflow: 'hidden' }}>

                {/* EMPTY CONTENT */}
                { (!mappings || (mappings && mappings.length === 0)) && (
                    <EmptyStateLayout icon={<Cross />} content="You don't have any mappings yet..." action={
                        <Flex gap={4}>
                            { indexId && (
                                <Link to={`/plugins/${pluginId}/indexes/${indexId}/mappings/new`}>
                                    <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                        Create Mapping
                                    </Button>
                                </Link>
                            )}
                            { !indexId && (
                                <Link to={`/plugins/${pluginId}/mappings/new`}>
                                    <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                        Create Preset Mapping
                                    </Button>
                                </Link>
                            )}
                            { indexId && (
                                <Button loading={isInProgress} variant="secondary"
                                onClick={ () => modalSelectPresetMappingOpen() } style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                    Add Preset Mapping
                                </Button>
                            )}
                        </Flex>
                    } />
                ) }

                {/* DISPLAY RECORDS  */}
                { mappings && Array.isArray(mappings) && mappings.length > 0 && (
                    <>
                       <Table colCount={8} rowCount={mappings.length} width="100%">
                        {/* footer={<TFooter icon={<Plus />}>Add another field to this collection type</TFooter>} */}
                            <Thead>
                                <Tr>
                                    <Th>
                                        <Checkbox aria-label="Select all entries" className="checkbox" />
                                    </Th>
                                    <Th>
                                        <Typography variant="sigma">UUID</Typography>
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

                                    {/* <Th>
                                        <Typography variant="sigma">Nested Level</Typography>
                                    </Th> */}

                                    { !indexId && (
                                        <Th>
                                            <Typography variant="sigma">Preset Default</Typography>
                                        </Th>
                                    )}

                                    { !indexId && (
                                        <Th>
                                            <Typography variant="sigma">Index(s)</Typography>
                                        </Th>
                                    )}
                                </Tr>
                            </Thead>
                            <Tbody>
                            { mappings.map((data, index) => {
                                return (
                                    <Tr key={index} className="row" onClick={() => handleRowClick(data.uuid) }>
                                        <Td>
                                            <Checkbox aria-label={`Select ${data.uuid}`} className="checkbox" />
                                        </Td>
                                        <Td style={{ overflow: 'hidden' }}>
                                            <Typography textColor="neutral600">{data.uuid}</Typography>
                                        </Td>
                                        <Td style={{ overflow: 'hidden' }}>
                                            <Typography textColor="neutral600">{data.post_type}</Typography>
                                        </Td>
                                        <Td style={{ overflow: 'hidden', maxWidth: '200px' }}>
                                            <Typography textColor="neutral600">{data.mapping}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{data.preset ? 'Yes' : '' }</Typography>
                                        </Td>
                                        {/* <Td>
                                            <Typography textColor="neutral600">{data.nested_level}</Typography>
                                        </Td> */}

                                        { !indexId && (
                                            <Td>
                                                <Typography textColor="neutral600">{data.default_preset}</Typography>
                                            </Td>
                                        )}

                                        { !indexId && (
                                            <Td>
                                                    { data.indexes && data.indexes.length > 0 && (
                                                        <>
                                                        { data.indexes.map((item, indexItem) => {
                                                                return (
                                                                    <Box key={indexItem}>
                                                                        <Link onClick={(e) => { requestGoToIndex(e, item.uuid) } } key={indexItem}>
                                                                            { item.uuid }
                                                                        </Link>                                                                    
                                                                        { indexItem != data.indexes.length && (
                                                                            <>&nbsp;</>
                                                                        ) }
                                                                    </Box>
                                                                )
                                                            })
                                                        }
                                                        </>
                                                    )}
                                            </Td>
                                        )}

                                        <Td>
                                            <Flex alignItems="end" gap={2}>
                                                <IconButton label="Edit mapping" noBorder icon={<Pencil />} onClick={(e) => requestEditMapping(e, data.uuid) } />

                                                { !modeOnlySelection && (
                                                    <IconButton onClick={(e) => requestDeleteMapping(e, data.id)} label="Delete" borderWidth={0} icon={<Trash />} />
                                                )}
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

            { showSelectModal && (
                <ModalLayout onClose={() => setShowSelectModal(false)}>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Select preset mapping
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Box width="100%">
                            <Mappings showOnlyPresets="true" modeOnlySelection="true" mappingHasBeenSelected={(e) => modalSelectPresetMappingClose(e)} />
                            {/* closeEvent={(e) => modalSelectPresetMappingClose(e)} */}
                        </Box>                        
                    </ModalBody>
                    {/* <ModalFooter
                        startActions={<></>}
                        endActions={<></>}
                    /> */}
                </ModalLayout>

            ) }
        </Flex>
    )
}