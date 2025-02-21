/**
 *
 * Mapping component
 *
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import pluginId from '../../pluginId'
import { Box, Button, Typography, Link, Icon, ToggleInput, TextInput,TextButton, Flex, Textarea, Table, Thead, Tbody, Tr, Td, Th, TFooter, Switch, SingleSelect, SingleSelectOption, TabGroup, Tabs, Tab, TabPanels, TabPanel, Grid, Field } from '@strapi/design-system'
import { apiGetMapping, apiCreateMapping, apiUpdateMapping, apiGetContentTypes } from '../../utils/apiUrls'
import axiosInstance  from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { getTypefromStrapiID } from '../../utils/getTypefromStrapiID'
import { useHistory } from "react-router-dom"
import { Pencil, Trash, ExclamationMarkCircle, Plus } from '@strapi/icons'

import * as Types from "../../../../types"

// LEGACY HARDCODED MAPPINGS, for reference.
// TODO: Delete when ready to.
// mappings: {
//     properties: {
//         "pin": {
//             type: "geo_point",
//             index: true
//         },
//         "Participants": {
//             type: "nested"
//         },
//         "Organizers": {
//             type: "nested"
//         },
//         "child_terms": {
//             type: "nested"
//         },        
//         // "uuid": {
//         //     type: "string",
//         //     index: "not_analyzed"
//         // }
//     }
// }

type Props = {
    mappingUUID: string
    indexUUID?: string
}

export const Mapping = ({ mappingUUID, indexUUID }:Props) => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState(false)
    const [contentTypes, setContentTypes] = useState<Types.StrapiContentTypes>()
    const [posttypeFinal, setPosttypeFinal] = useState<string>()
    const [mappingRaw, setMappingRaw] = useState<Types.Mapping>()
    const [mapping, setMapping] = useState<Types.Mapping>()
    const mappingUUIDComputed = useRef((mappingUUID && mappingUUID === 'new') || !mappingUUID ? null : mappingUUID)
    const history = useHistory()
    const showNotification = useNotification()

    //useEffect(() => console.log('update finished'), [prop])
    const changesExist = useMemo(() => mapping != mappingRaw, [mapping])

    const resetForm = () => {
        console.log("------------------------------------------------------------")
        console.log("Reset mapping form 111 mappingRaw: ", mappingRaw)
        console.log("Reset mapping form 222 mapping: ", mapping)
        setMapping(undefined)
        console.log("Reset mapping form 333 mapping: ", mapping)
        setMapping(mappingRaw)
    }

    const requestGetMapping = async () => {

        console.log("requestGetMapping 111")

        if (mappingUUID) {

            console.log("requestGetMapping 222")

            setIsInProgress(true)
            let work = await axiosInstance.get(apiGetMapping(mappingUUID))
            .then( (response) => {
                if (response.data) {
                    console.log("requestGetMapping 333", response.data)
                    return response.data
                }
            })
            .catch((error) => {
                console.log("PAGE requestGetMapping ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
                //getContentTypes()
            })
            console.log("requestGetMapping 444", work)
            if (work && work.mappingRaw) {
                console.log("requestGetMapping 555", work)

                let work2 = work
                work2.mappingRaw = JSON.parse(work2.mappingRaw)
                setMappingRaw(work2)
                setMapping(work2)
                setPosttypeFinal(work2.post_type)

            } else {
                console.log("requestGetMapping 666", work)
                // TODO: Maybe show an error view?
                console.log("Problem getting the mapping")
            }

        }
        
    }

    const getContentTypes = async () => {
        setIsInProgress(true)
        console.log("MAPPING COMPONENT - getContentTypes 111")
        await axiosInstance.get(apiGetContentTypes)
        .then((response) => {
            console.log("MAPPING COMPONENT - getContentTypes 222", response.data)
            // showNotification({
            //     type: "success", message: "getContentTypes: " + response.data, timeout: 5000
            // })
            setContentTypes(response.data)
        })
        .catch((error) => {
            console.log("PAGE getContentTypes ERROR: ", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            console.log("MAPPING COMPONENT - getContentTypes 333")
            setIsInProgress(false)
        })
    }

    const requestCreateMapping = async () => {
        setIsInProgress(true)

        if (mapping && !mapping.uuid) {

            let output:Types.Mapping = mapping

            if (indexUUID) {
                output.indexes = [ indexUUID ]
            } else {
                output.preset = true
            }

            await axiosInstance.post(apiCreateMapping, {
                data: output
            })
            .then( async (response) => {

                let work = response.data
                work.mappingRaw = JSON.parse(work.mappingRaw)
                setMappingRaw(work)
                setMapping(work)

                if (indexUUID) {
                    await history.replace(`/plugins/${pluginId}/indexes/${indexUUID}/mappings/${response.data.uuid}`)

                } else {
                    await history.replace(`/plugins/${pluginId}/mappings/${response.data.uuid}`)
                }

            })
            .catch((error) => {
                console.log("PAGE MAPPING - requestCreateMapping ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
        }
    }

    const requestUpdateMapping = () => {
        setIsInProgress(true)

        if (mapping) {
            //let output:Mapping = JSON.parse(JSON.stringify(mapping))
            //output.mappingRaw = JSON.stringify(output.mappingRaw)

            return axiosInstance.post(apiUpdateMapping(mapping.uuid), {
                data: mapping
            })
            .then((response) => {
                // showNotification({
                //     type: "success", message: "Created the mapping: " + response, timeout: 5000
                // })
                setMapping(response.data)
                setMappingRaw(response.data)
            })
            .catch((error) => {
                console.log("PAGE requestUpdateMapping ERROR: ", error)
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
    // FORM STUFF
    // ===============================

    const typeSelected = (posttype:string) => {
        let newMapping:Types.Mapping = {
            post_type: posttype,
            mappingRaw: {},
            //"registered_index": indexUUID ? indexUUID : undefined
            //"preset": 'dfdf'
            //"nested_level": 2
            //"registered_index": 'someregindex'
            //"mapping_type": 'custom',
            //"default_preset": true
        }

        setMappingRaw(newMapping)
        setMapping(newMapping)
        setPosttypeFinal(posttype)
    }

    const updateFieldActive = async (key:string) => {

        if (mapping) {

            let output:Types.Mapping

            // TODO: This seems really stupid, but need to deep clone here otherwise strange reactivity occurs.
            // e.g. without this deep clone, mappingRaw gets updated, even though we don't touch it in this func!
            // Perhaps reactivity is being set earlier somewhere.
            output = JSON.parse(JSON.stringify(mapping))

            if (output.mappingRaw && output.mappingRaw[key]) {
                delete output.mappingRaw[key]
            } else {
                output.mappingRaw[key] = {
                    type: 'text', // TODO: We need to autodetect here; for now just resorting to default "text"
                    index: false
                }
            }

            
            setMapping(output)
        }
        
        // else {
        //     output.mappingRaw = {}
        //     output.mappingRaw[key] = {}
        // }

    }

    const updateFieldIndex = async (key: string) => {

        let output = JSON.parse(JSON.stringify(mapping))

        if (output.mappingRaw[key]) {
            output.mappingRaw[key].index = !output.mappingRaw[key].index
            setMapping(output)
        }
    }

    const updateFieldDataType = async (key: string, type: string) => {
        if (mapping && mapping.mappingRaw && mapping.mappingRaw[key]) {
            let output:Types.Mapping = mapping
            output.mappingRaw[key].type = type
            setMapping(output)
        }
    }

    // const validatePayload = (payload) => {
    //     if (payload && payload.length > 0) {
    //         try {
    //             JSON.parse(payload)
    //             return true
    //         } catch (e) {
    //             return false
    //         }
    //     } else {
    //         return true
    //     }
    // }

    // ===============================
    // LIFECYCLE
    // ===============================

    useEffect(() => {
        if (mappingUUID && mappingUUID != 'new') {
            requestGetMapping()
        }
    }, [])


    useEffect(() => {
        getContentTypes()
    }, [])

    return  (
        <Box>
            { contentTypes && Object.values(contentTypes).length > 0 && (
                <>

                <Flex width="100%" justifyContent="space-between">
                    <Box>
                        <Box>
                            <Typography variant="alpha">{ mappingUUID && mappingUUID != 'new' ? 'Mapping ' + mappingUUID : indexUUID ? 'Create Mapping' : 'Create Preset Mapping'}</Typography>
                        </Box>

                        { posttypeFinal && (
                            <Flex gap={2}>
                                <Typography variant="beta">For post type: {getTypefromStrapiID(posttypeFinal)}</Typography>
                                <Typography variant="sigma">({posttypeFinal})</Typography>
                            </Flex>
                        )}
                    </Box>

                    { mappingUUID && mappingUUID != 'new' && (
                        <Flex gap={4}>

                            { changesExist && (
                                <>
                                    <Icon as={ExclamationMarkCircle} />
                                    <Typography variant="sigma">Unsaved changes</Typography>
                                    <TextButton onClick={() => resetForm()}>
                                        Reset
                                    </TextButton>
                                </>
                            )}

                            <Button onClick={() => requestUpdateMapping()} variant="secondary" disabled={!changesExist}>
                                Save
                            </Button>
                        </Flex>
                    )}

                    { (!mappingUUID || mappingUUID === 'new') && posttypeFinal && (
                        <Button onClick={() => requestCreateMapping()} variant="secondary">
                            { indexUUID ? 'Save New Mapping' : 'Save New Preset Mapping' }
                        </Button>
                    )}
                </Flex>

                { (!mappingUUID || mappingUUID === 'new') && !posttypeFinal && contentTypes && (
                    <Box width="100%">

                        <Table colCount={2} rowCount={contentTypes.length} width="100%">
                        {/* footer={<TFooter icon={<Plus />}>Add another field to this collection type</TFooter>} */}
                            <Thead>
                                <Tr>
                                    <Th>
                                        <Typography variant="sigma">Type</Typography>
                                    </Th>
                                    <Th>
                                        
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
                                            <Button onClick={() => typeSelected(key)}>Use Type</Button>
                                        </Td>
                                    </Tr>
                                )
                            }) }
                            </Tbody>
                        </Table>
                        <Box paddingTop={2} paddingBottom={2}>
                            <Typography textColor="neutral600">This view lists approved content types for mapping.</Typography>
                        </Box>
                    </Box>
                )}

                {/* -------- TABS ------------------*/}
                { posttypeFinal && (

                    <TabGroup initialSelectedTabIndex={0}>

                        {/* -------- TABS ACTUAL ------------------*/}
                        <Tabs>
                            <Tab id="fields">Fields</Tab>
                            <Tab id="raw">Raw Output</Tab>
                        </Tabs>

                        <TabPanels>

                            {/* -------- TAB: FIELDS ------------------*/}
                            <TabPanel id="fields">
                                {
                                    // TODO: Remove this ts-ignore and fix this properly.
                                    // @ts-ignore
                                    Object.entries(contentTypes[posttypeFinal]).map(([key,val]) => {
                                    //Object.keys(fields).map((key,index) => {
                                        
                                        return (
                                            
                                            <Box key={key} padding={4} background="neutral0" shadow="filterShadow">
                                                <Typography variant="beta">{ key }</Typography>
                                                {/* <div>field is: { val }</div> */}

                                                <Flex gap={4} width='100%' style={{ justifyContent: 'space-between'}}>

                                                    <Flex direction='column' style={{ alignSelf: 'stretch' }}>
                                                        <div style={{fontSize: '0.75rem', lineHeight: '1.33'}}>
                                                            <Typography variant="pi" fontWeight={'bold'}>Enabled</Typography>
                                                        </div>
                                                        <div style={{height: '100%', alignContent: 'center'}}>

                                                        {/* selected={mapping[key]} */}

                                                        {/* { mapping && (
                                                            <>
                                                            <div>
                                                                selected is: {JSON.stringify(mapping)}
                                                            </div>
                                                            </>
                                                        )} */}

                                                            <Switch
                                                                selected={mapping && mapping.mappingRaw[key] && Object.hasOwn(mapping.mappingRaw, key)}
                                                                onChange={() => updateFieldActive(key)}
                                                                label='Active'
                                                                onLabel='Enabled'
                                                                offLabel='Disabled' />
                                                                {/* checked={config.index} onChange={(e) => updateIndex(e.target.checked)}  */}
                                                        </div>
                                                    </Flex>

                                                    <Flex style={{flexDirection: 'column', alignSelf: 'stretch'}}>
                                                        <div style={{fontSize: '0.75rem', lineHeight: '1.33'}}>
                                                            <Typography variant="pi" fontWeight={'bold'}>Index</Typography>
                                                        </div>
                                                        <div style={{height: '100%', alignContent: 'center'}}>
                                                            <Switch
                                                                selected={mapping && mapping.mappingRaw[key] && mapping.mappingRaw[key].index}
                                                                onChange={() => updateFieldIndex(key)}
                                                                disabled={mapping && !mapping.mappingRaw[key]}                                            
                                                                label='Index'
                                                                onLabel='Enabled'
                                                                offLabel='Disabled' />
                                                                {/* style={{background:'pink !important'}} */}
                                                                
                                                        </div>
                                                    </Flex>

                                                    {/* onClick={toggleIndexingEnabled}
                                                    selected={indexingEnabled} */}

                                                    {/* <TextInput label="Data Type" placeholder="Enter explicit data type" name="Data Type" /> */}
                                                    {/* onChange={e => updateMappedFieldName(e.target.value)} value={config.searchFieldName || ""} */}

                                                    <Box style={{flex: '1'}}>
                                                        <SingleSelect
                                                            label="Data Type"
                                                            value={mapping && mapping.mappingRaw[key] && mapping.mappingRaw[key].type}
                                                            onChange={ (value:string) => updateFieldDataType(key, value)}
                                                            disabled={mapping && !mapping.mappingRaw[key]}>
                                                            <SingleSelectOption value="dynamic">(autodetect)</SingleSelectOption>
                                                            <SingleSelectOption value="binary">Binary</SingleSelectOption>
                                                            <SingleSelectOption value="boolean">Boolean</SingleSelectOption>
                                                            <SingleSelectOption value="keyword">Keyword</SingleSelectOption>
                                                            <SingleSelectOption value="text">Text</SingleSelectOption>
                                                            <SingleSelectOption value="long">Number long</SingleSelectOption>
                                                            <SingleSelectOption value="double">Number double</SingleSelectOption>
                                                            <SingleSelectOption value="date">Date</SingleSelectOption>
                                                            <SingleSelectOption value="geo_point">Geopoint</SingleSelectOption>
                                                            <SingleSelectOption value="nested">Nested</SingleSelectOption>
                                                            <SingleSelectOption value="etc">etc</SingleSelectOption>
                                                        </SingleSelect>
                                                    </Box>

                                                    <Box style={{flex: '1'}}>
                                                        <TextInput
                                                        label="Custom field name (in ES)"
                                                        placeholder="Enter custom field name" name="Custom field name"
                                                        disabled={mapping && !mapping.mappingRaw[key]} />
                                                        {/* onChange={e => updateMappedFieldName(e.target.value)} value={config.searchFieldName || ""} */}
                                                    </Box>


                                                </Flex>

                                                <Box paddingTop={4} paddingBottom={4}>
                                                    <hr />
                                                </Box>
                                            </Box>

                                        )
                                    
                                    })
                                }
                            </TabPanel>

                            {/* -------- TAB: RAW OUTPUT ------------------*/}
                            <TabPanel id="raw">
                                <Box padding={4} background="neutral0" shadow="filterShadow">
                                    <Typography variant="beta">Preview raw output</Typography>
                                    <Box marginTop={2}>
                                        <Typography variant="delta">
                                            This is what the raw mapping output will look like when applied to an index Elasticsearch instance.
                                            Keep in mind, in that ES index, you may see other fields if additional mappings have been applied to it.
                                        </Typography>
                                    </Box>
                                    <Box padding={8} marginTop={4} background="secondary100">
                                        { !mapping || (mapping && !mapping.mappingRaw) && (
                                            <>(Please apply some mappings)</>
                                        )}
                                        { mapping && mapping.mappingRaw && (
                                            <pre>{ JSON.stringify(mapping.mappingRaw, null, 8) }</pre>
                                        )}
                                    </Box>
                                </Box>
                            </TabPanel>

                        </TabPanels>
                    </TabGroup>
                )}

                {/* <TextInput value={newMapping} onChange={(event) => { setNewMapping(event.target.value) }} label="Mapping name" placeholder="Enter mapping name" name="Mapping name field" /> */}
                {/* onChange={e => updateMappedFieldName(e.target.value)} value={config.searchFieldName || ""} */}

                {/* "post_type": {
                    "type": "string",
                    "required": true
                },
                "mapping": {
                    "type": "richtext"
                },
                "preset": {
                    "type": "string", // id of a preset mapping
                },
                "nested_level": {
                    "type": "number"
                },
                "registered_index": {
                    "type": "string", // id of a registered index
                },


                // "mapping_type": {
                //     "type": "string", // 'custom', 'preset'
                //     "required": true
                // },
                "default_preset": {
                    "type": "boolean"
                }, */}

                </>
            )}
        </Box>
    )
}

// Initializer.propTypes = {
//     setPlugin: PropTypes.func.isRequired
// }

//export default Mapping
