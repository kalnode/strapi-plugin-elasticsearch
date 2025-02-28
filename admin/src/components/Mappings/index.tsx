/**
 *
 * COMPONENT: Mappings
 *
 */

import { useEffect, useRef, useState } from 'react'
import pluginId from '../../pluginId'
import { Box, Flex, Button, ModalLayout, ModalHeader, Link, ModalFooter, ModalBody, Table, Thead, Tbody, Tr, Td, Th, TFooter, EmptyStateLayout, Checkbox, TabGroup, Tabs, Tab, TabPanels, TabPanel, TextInput, IconButton, CaretDown, Typography } from '@strapi/design-system'
import { Pencil, Trash, Refresh, Plus, Cross } from '@strapi/icons'

import { apiGetMappings, apiDeleteMapping, apiDetachMappingFromIndex, apiGetESMapping } from '../../utils/apiUrls'
import { requestAPI_DeleteMapping } from '../../utils/api/mappings'

import axiosInstance  from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { useHistory } from 'react-router-dom'
import { requestUpdateIndex } from '../../utils/api/indexes'

import { Mapping } from "../../../../types"
import { estypes } from '@elastic/elasticsearch'

type Props = {
    indexUUID?: string
    showOnlyPresets?: boolean
    type?: string
    modeOnlySelection?: boolean
    mappingHasBeenSelected?: any // TODO: Should this be an.. object? Function? What? We're passing a function through this.
}

export const Mappings = ({ indexUUID, showOnlyPresets, type, modeOnlySelection, mappingHasBeenSelected }:Props) => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState(false)
    const [mappings, setMappings] = useState<Array<Mapping>>()
    const history = useHistory()
    const showNotification = useNotification()

    // TODO: Apply proper mapping type, like... <estypes.mapping> ??
    const [ESMapping, setESMapping] = useState()

    useEffect(() => {
        requestGetMappings()
        requestGetESMapping()
    }, [])

    // ===============================
    // API REQUESTS
    // ===============================

    const requestGetMappings = () => {
        setIsInProgress(true)
        axiosInstance.get(apiGetMappings(indexUUID))
        .then((response) => {
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                if (showOnlyPresets) {
                    if (type) {
                        setMappings(response.data.filter( (x) => x.preset && x.post_type === type))
                    } else {
                        setMappings(response.data.filter( (x) => x.preset))
                    }
                } else {
                    setMappings(response.data)
                }
            } else {
                setMappings(undefined)
            }
        })
        .catch((error) => {
            console.log("COMPONENT Mappings - requestGetMappings error", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
        })

    }

    const requestDeleteMapping = async (e:Event, mapping:Mapping) => {
        e.stopPropagation()
        setIsInProgress(true)

        // TODO: Possibly add visual prompt to user if they're attempting to delete a preset mapping.
        // They must be aware that in doing so may affect multiple indexes that the preset mapping is applied to.

        await requestAPI_DeleteMapping(mapping, indexUUID)
        .catch((error) => {
            console.log("COMPONENT Mappings - requestDeleteMapping error", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(async () => {
            await requestGetMappings()
            setIsInProgress(false)
        })

    }

    const requestGetESMapping = () => {
        setIsInProgress(true)

        if (indexUUID) {
            axiosInstance.get(apiGetESMapping(indexUUID))
            .then((response) => {
                // TODO: Work on a better return from the server. For now doing this sillyness.
                if (response && response.data && (Array.isArray(response.data) || response.data.constructor.name === "Object")) {
                    setESMapping(response.data)
                } else {
                    setESMapping(undefined)
                }
            })
            .catch((error) => {
                console.log("COMPONENT Mappings - requestGetMappings error", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
        }
    }

    // ===============================
    // CLICK EVENTS
    // ===============================

    const goToEditMapping = (mappingUUID:string, e?:Event) => {
        e?.stopPropagation()
        if (indexUUID) {
            history.push(`/plugins/${pluginId}/indexes/${indexUUID}/mappings/${mappingUUID}`)
        } else {
            history.push(`/plugins/${pluginId}/mappings/${mappingUUID}`)
        }
    }

    const goToIndex = (indexUUID:string, e?:Event) => {
        e?.stopPropagation()
        if (indexUUID) {
            history.push(`/plugins/${pluginId}/indexes/${indexUUID}`)
        }
    }

    const handleRowClick = (mapping:Mapping) => {
        if (modeOnlySelection) {
            mappingHasBeenSelected(mapping)
        } else if (mapping && mapping.uuid) {
            goToEditMapping(mapping.uuid)
        }
    }


    // ===============================
    // TEMPLATE
    // ===============================

    return  (

        <Flex width="100%" direction="column" alignItems="start" gap={2} background="neutral100">


            {/* ---------------------------------------------- */}
            {/* HEADER */}
            {/* ---------------------------------------------- */}
            <Flex direction="column" justifyContent="start">
                <Typography variant="alpha">{ showOnlyPresets ? 'Preset Mappings' : 'Mappings'}</Typography>
                <Typography variant="beta">For { type }</Typography>
            </Flex>

            { !modeOnlySelection && (

                <Flex width="100%" gap={4} justifyContent="space-between">
                    {/* <Typography variant="delta">Actions</Typography>
                    <Button loading={isInProgress} fullWidth variant="secondary" onClick={requestGetMappings}>Reload list</Button> */}

                    <Box>
                        {/* <IconButton onClick={ () => requestGetMappings() } label="Get mappings" icon={<Refresh />} /> */}
                    </Box>
                    
                    <Flex gap={4}>
                        {/* { indexUUID && (
                            <Link to={`/plugins/${pluginId}/indexes/${indexUUID}/mappings/new`}>
                                <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                    Create Mapping
                                </Button>
                            </Link>
                        )} */}
                        { !indexUUID && (
                            <Flex direction="column" justifyContent="start">
                                <Link to={`/plugins/${pluginId}/mappings/new`}>
                                    <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                        Create Preset Mapping
                                    </Button>
                                </Link>
                                <Link to={`/plugins/${pluginId}/mappings/new/${type}`}>
                                    <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                        Create Preset Mapping for {type}
                                    </Button>
                                </Link>
                            </Flex>
                        )}
                        {/* { indexUUID && (
                            <Button loading={isInProgress} variant="secondary"
                            onClick={ () => modalSelectPresetMappingOpen() } style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                Add Preset Mapping
                            </Button>
                        )} */}
                    </Flex>
                </Flex>
            )}


            {/* ---------------------------------------------- */}
            {/* MAIN CONTENT */}
            {/* ---------------------------------------------- */}
            <Box width="100%" style={{ overflow: 'hidden' }}>

                {/* EMPTY CONTENT */}
                { (!mappings || (mappings && mappings.length === 0)) && (
                    <EmptyStateLayout icon={<Cross />}
                        content={ type ? "You don't have any preset mappings for " + type : "You don't have any preset mappings yet..."}
                        
                        action={
                        <Flex gap={4}>
                            {/* { indexUUID && (
                                <Link to={`/plugins/${pluginId}/indexes/${indexUUID}/mappings/new`}>
                                    <Button variant="secondary" style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                        Create Mapping
                                    </Button>
                                </Link>
                            )} */}
                            { !indexUUID && (
                                <Flex direction="column" justifyContent="start" gap={4}>
                                    <Link to={`/plugins/${pluginId}/mappings/new/${type}`}>
                                        <Button variant="primary" style={{ whiteSpace: 'nowrap', color: 'white' }} startIcon={<Plus />}>
                                            Create Preset for {type}
                                        </Button>
                                    </Link>
                                    <Link to={`/plugins/${pluginId}/mappings`}>
                                        <Button variant="secondary" style={{ whiteSpace: 'nowrap' }}>
                                            Manage Mapping Presets
                                        </Button>
                                    </Link>

                                </Flex>
                            )}
                            {/* { indexUUID && (
                                <Button loading={isInProgress} variant="secondary"
                                onClick={ () => modalSelectPresetMappingOpen() } style={{ whiteSpace: 'nowrap' }} startIcon={<Plus />}>
                                    Add Preset Mapping
                                </Button>
                            )} */}
                        </Flex>
                    } />
                )}

                {/* NORMAL CONTENT */}
                { (mappings && Array.isArray(mappings) && mappings.length > 0) && (
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

                            { !indexUUID && (
                                <Th>
                                    <Typography variant="sigma">Preset Default</Typography>
                                </Th>
                            )}

                            { !indexUUID && (
                                <Th>
                                    <Typography variant="sigma">Index(s)</Typography>
                                </Th>
                            )}
                        </Tr>
                    </Thead>
                    <Tbody>
                    { mappings.map((mapping, index) => {
                        return (
                            <Tr key={index} className="row" onClick={() => handleRowClick(mapping) }>
                                <Td>
                                    <Checkbox aria-label={`Select ${mapping.uuid}`} className="checkbox" />
                                </Td>
                                <Td style={{ overflow: 'hidden' }}>
                                    <Typography textColor="neutral600">{mapping.uuid}</Typography>
                                </Td>
                                <Td style={{ overflow: 'hidden' }}>
                                    <Typography textColor="neutral600">{mapping.post_type}</Typography>
                                </Td>
                                <Td style={{ overflow: 'hidden', maxWidth: '200px' }}>
                                    <Typography textColor="neutral600">{JSON.stringify(mapping.fields)}</Typography>
                                </Td>
                                <Td>
                                    <Typography textColor="neutral600">{mapping.preset ? 'Yes' : '' }</Typography>
                                </Td>
                                {/* <Td>
                                    <Typography textColor="neutral600">{data.nested_level}</Typography>
                                </Td> */}

                                { !indexUUID && (
                                    <Td>
                                        <Typography textColor="neutral600">{mapping.default_preset}</Typography>
                                    </Td>
                                )}

                                { !indexUUID && (
                                    <Td>
                                            {/* TODO: Re-introduce displaying what indexes the mapping belongs to */}
                                            { mapping.indexes && mapping.indexes.length > 0 && (
                                                <>
                                                { mapping.indexes.map((indexUUID, indexNumber) => {
                                                    return (
                                                        <Box key={indexNumber}>
                                                            <Link onClick={(e:Event) => { goToIndex(indexUUID, e) } } key={indexNumber}>
                                                                { indexNumber }
                                                            </Link>                                                                    
                                                            { indexNumber != mapping.indexes?.length && (
                                                                <>&nbsp;</>
                                                            ) }
                                                        </Box>
                                                    )
                                                }) }
                                                </>
                                            )}
                                    </Td>
                                )}

                                <Td>
                                    <Flex alignItems="end" gap={2}>
                                        <IconButton label="Edit mapping" noBorder icon={<Pencil />} onClick={ (e:Event) => goToEditMapping(mapping.uuid!, e) } />

                                        { !modeOnlySelection && (
                                            <IconButton onClick={ (e:Event) => requestDeleteMapping(e, mapping) } label="Delete" borderWidth={0} icon={<Trash />} />
                                        )}
                                    </Flex>
                                </Td>
                            </Tr>
                        )
                    }) }
                    </Tbody>
                </Table>
                <Box paddingTop={2} paddingBottom={2}>
                    <Typography textColor="neutral600">List of mappings</Typography>
                </Box>
            
                </>
                )}

            </Box>

        </Flex>
    )
}