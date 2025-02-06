/**
 *
 * Mapping component
 *
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import pluginId from '../../pluginId'
import { Box, Button, Typography, Link, Icon, ToggleInput, TextInput, Flex, Textarea, Table, Thead, Tbody, Tr, Td, Th, TFooter, Switch, SingleSelect, SingleSelectOption, TabGroup, Tabs, Tab, TabPanels, TabPanel, Grid, Field } from '@strapi/design-system'
import { apiGetMapping, apiGetMappings, apiCreateMapping, apiUpdateMapping, apiDeleteMapping, apiGetContentTypes } from '../../utils/apiUrls'
import axiosInstance  from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { getTypefromStrapiID } from '../../utils/getTypefromStrapiID'
import { useHistory } from "react-router-dom"
import { Pencil, Trash, ExclamationMarkCircle, Plus } from '@strapi/icons'
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



export const Mapping = ({ indexId, mappingId }) => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState(false)
    const [contentTypes, setContentTypes] = useState(null)
    const [posttypeFinal, setPosttypeFinal] = useState(null)
    const [mappingRaw, setMappingRaw] = useState(null)
    const [mapping, setMapping] = useState(null)
    const mappingIdComputed = useRef((mappingId && mappingId === 'new') || !mappingId ? null : mappingId)
    const history = useHistory()
    const showNotification = useNotification()

    const changesExist = useMemo(() => mapping != mappingRaw)

    const requestGetMapping = async () => {

        if (mappingId) {

            console.log("requestGetMapping - 11111111", mappingId)
            setIsInProgress(true)
            let work = await axiosInstance.get(apiGetMapping(mappingId))
                .then( (response) => {
                    console.log("get requestGetMapping 222: ", response)
                    if (response.data) {
                        return response.data
                    }
                })
                // .catch((error) => {
                //     console.log("PAGE requestGetMapping ERROR: ", error)
                //     showNotification({
                //         type: "warning", message: "An error has encountered: " + error, timeout: 5000
                //     })
                // })
                // .finally(() => {
                //     setIsInProgress(false)
                //     //getContentTypes()
                // })


            console.log("Work is 111: ", work)


            let work2 = work

            work2.mapping = JSON.parse(work2.mapping)

            console.log("work2 is 222: ", work2.post_type)
            setMappingRaw(work2)
            setMapping(work2)
            setPosttypeFinal(work2.post_type)

            console.log("posttypeFinal 111 is: ", posttypeFinal)

        }
        
    }

    const getContentTypes = async () => {
        setIsInProgress(true)
    
        let work = await axiosInstance.get(apiGetContentTypes)
        .then((response) => {
            console.log("PAGE getContentTypes response 111: ", response.data)
            // showNotification({
            //     type: "success", message: "getContentTypes: " + response.data, timeout: 5000
            // })
            return response.data
        })
        .catch((error) => {
            console.log("PAGE getContentTypes ERROR: ", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
        })

        console.log("PAGE getContentTypes response 222: ", work)

        setContentTypes(work)
        
    }

    const requestCreateMapping = async () => {
        setIsInProgress(true)

        if (mapping) {

            let output = {...mapping}
            
            if (indexId) {
                output.indexes = [ indexId ]
            } else {
                output.preset = true
            }

            console.log("requestCreateMapping mapping is: ", output)

            // let workGetIndex = await axiosInstance.get(apiGetIndex(indexId))
            // .then( (response) => {
            //     console.log("get requestGetIndex 111: ", response)
            //     if (response.data) {
            //         return response.data
            //     }
            // })
            // .catch((error) => {
            //     console.log("PAGE requestGetIndex ERROR: ", error)
            //     showNotification({
            //         type: "warning", message: "An error has encountered: " + error, timeout: 5000
            //     })
            // })

            // console.log(workGetIndex)

            //output.indexes = [workGetIndex]

            await axiosInstance.post(apiCreateMapping, {
                data: output
            })
            .then((response) => {
                console.log("PAGE MAPPING - requestCreateMapping response: ", response.data)
                setMappingRaw(response.data)
                if (indexId) {
                    history.replace(`/plugins/${pluginId}/indexes/${indexId}/mappings/${response.data.id}`)
                } else {
                    history.replace(`/plugins/${pluginId}/mappings/${response.data.id}`)
                }
                // showNotification({
                //     type: "success", message: "Created the mapping: " + response, timeout: 5000
                // })
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

        console.log("requestUpdateMapping is: ", mapping)

        let output = {...mapping}

        output.mapping = JSON.stringify(output.mapping)

        console.log("requestUpdateMapping Output is: ", output)

        setMappingRaw(mapping)

        return axiosInstance.post(apiUpdateMapping(mappingId), {
            data: mapping
        })
            .then((response) => {
                console.log("PAGE requestUpdateMapping response: ", response)

                // showNotification({
                //     type: "success", message: "Created the mapping: " + response, timeout: 5000
                // })
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


    // ===============================
    // FORM STUFF
    // ===============================

    const typeSelected = (posttype) => {
        let work = {
            "post_type": posttype,
            "mapping": {},
            //"registered_index": indexId ? indexId : undefined
            //"preset": 'dfdf'
            //"nested_level": 2
            //"registered_index": 'someregindex'
            //"mapping_type": 'custom',
            //"default_preset": true
        }

        setMappingRaw(work)
        setMapping(work)

        //setPosttypeFinal(posttype)

        setPosttypeFinal(posttype)
    }

    const updateFieldActive = async (key) => {
        // let output = { ...mapping }
        // if (output[key]) {
        //     delete output[key]
        // } else {
        //     output = { ...output, [key]: { active: true } }
        // }
        // await setMapping(output)
        console.log("updateFieldActive 111a777aa", mapping)
        let output = {}
        console.log("updateFieldActive 111bbb", output)


        if (mapping) {
            output = { ...mapping }
            if (output.mapping[key]) {
                console.log("updateFieldActive 222aaa", output)
                delete output.mapping[key]
            } else {
                console.log("updateFieldActive 222bbb", output)
                //output = { ...output, [key]: { } }
                output.mapping[key] = {}
            }
        } else {
            output.mapping[key] = {}
        }
        console.log("updateFieldActive 333", output)
        setMapping(output)
    }

    const updateFieldIndex = async (key) => {
        let output = { ...mapping }
        if (output.mapping[key]) {
            output.mapping[key].index = !output.mapping[key].index
            setMapping(output)
        }
    }

    const updateFieldDataType = async (key, type) => {
        let output = { ...mapping }
        if (output.mapping[key]) {
            console.log("Hello? wer45435", type)
            //let output = { ...mapping }
            output.mapping[key].type = type
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
        if (mappingId && mappingId != 'new') {
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
                            <Typography variant="alpha">{ mappingId && mappingId != 'new' ? 'Mapping ' + mappingId : indexId ? 'Create Mapping' : 'Create Preset Mapping'}</Typography>
                        </Box>

                        { posttypeFinal && (
                            <Flex gap={2}>
                                <Typography variant="beta">For post type: {getTypefromStrapiID(posttypeFinal)}</Typography>
                                <Typography variant="sigma">({posttypeFinal})</Typography>
                            </Flex>
                        )}
                    </Box>

                    { mappingId && mappingId != 'new' && (
                        <Flex gap={4}>
                            
                            { changesExist && (
                                <>
                                    <Icon as={ExclamationMarkCircle} />
                                    <Typography variant="sigma">Unsaved changes</Typography>
                                </>
                            )}
                            

                            <Button onClick={() => requestUpdateMapping()} variant="tertiary" disabled={!changesExist}>
                                Save
                            </Button>
                        </Flex>
                    )}

                    { (!mappingId || mappingId === 'new') && posttypeFinal && (
                        <Button onClick={() => requestCreateMapping()} variant="tertiary">
                            { indexId ? 'Save New Mapping' : 'Save New Preset Mapping' }
                        </Button>
                    )}
                </Flex>

                { (!mappingId || mappingId === 'new') && !posttypeFinal && (
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
                                                                selected={mapping && mapping.mapping[key] && Object.hasOwn(mapping.mapping, key)}
                                                                onChange={(e) => updateFieldActive(key)}
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
                                                                selected={mapping && mapping.mapping[key] && mapping.mapping[key].index}
                                                                onChange={(e) => updateFieldIndex(key)}
                                                                disabled={mapping && !mapping.mapping[key]}                                            
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
                                                            value={mapping && mapping.mapping[key] && mapping.mapping[key].type}
                                                            onChange={ (value) => updateFieldDataType(key, value)}
                                                            disabled={mapping && !mapping.mapping[key]}>
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
                                                        disabled={mapping && !mapping.mapping[key]} />
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
                                <Box padding={8} background="neutral0" shadow="filterShadow">
                                    <Typography variant="delta">
                                        This is the raw mapping output that will be applied to an Elasticsearch instance. Keep in mind, the instance may have additional mappings applied to it.
                                    </Typography>
                                </Box>
                                <hr />
                                <Box padding={8} background="neutral0" shadow="filterShadow">
                                    { !mapping && (
                                        <>(Please apply some mappings)</>
                                    )}
                                    { mapping && (
                                        <pre>{ JSON.stringify(mapping, null, 8) }</pre>
                                    )}
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
