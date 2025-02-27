/**
 *
 * MappingFields component
 *
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import { Box, Button, Typography, Link, Icon, ToggleInput, Tooltip, TextInput,TextButton, Flex, Textarea, Table, Thead, Tbody, Tr, Td, Th, TFooter, Switch, SingleSelect, SingleSelectOption, TabGroup, Tabs, Tab, TabPanels, TabPanel, Grid, Field } from '@strapi/design-system'
import { Pencil, Trash, ExclamationMarkCircle, Plus, Information } from '@strapi/icons'
import * as Types from "../../../../types"

type Props = {
    contentTypeNames: Array<string>
    mapping?: Types.Mapping // TODO: Make this optional ? to solve TS warnings in parent of instance, but unsure why? Ideally it's required, not optional!
    mappingUpdated: Function
}

export const MappingFields = ({ contentTypeNames, mapping, mappingUpdated }:Props) => {

    // ===============================
    // GENERAL
    // ===============================

    // TODO: We use a local state to hold changes and convey to parent via event. Is this unnecessary? 
    const [mappingLocal, setMappingLocal] = useState<Types.Mapping>()

    useEffect(() => {
        // TODO: Scrutinize this. In effect, this is just enabling 2-way binding. Do we need it? Can we do better?
        if (!mappingLocal || (mappingLocal && mappingLocal != mapping)) setMappingLocal(mapping)
    }, [mapping])

    useEffect(() => {
        // TODO: Scrutinize this. In effect, this is just enabling 2-way binding. Do we need it? Can we do better?
        if (mappingLocal && mappingLocal != mapping) mappingUpdated(mappingLocal)
    }, [mappingLocal])


    // ===============================
    // FORM STUFF
    // ===============================

    const updateFieldAdd = async (field:string) => {
        if (mappingLocal) {
            let work = JSON.parse(JSON.stringify(mappingLocal))

            if (!work.fields){
                work.fields = {}
            }

            if (work.fields[field]) {
                delete work.fields[field]
            } else {
                work.fields[field] = {
                    active: true
                }
            }
            setMappingLocal(work)
        }
    }

    const updateFieldActive = async (field:string) => {
        if (mappingLocal) {
            let work = JSON.parse(JSON.stringify(mappingLocal))
            work.fields[field].active = !work.fields[field].active
            setMappingLocal(work) 
        }
    }

    const updateFieldIndex = async (field:string) => {
        if (mappingLocal) {
            let work = JSON.parse(JSON.stringify(mappingLocal))
            work.fields[field].index = !work.fields[field].index
            setMappingLocal(work) 
        }
    }

    const updateFieldDataType = async (field: string, type: string) => {
        if (mappingLocal) {
            let work = JSON.parse(JSON.stringify(mappingLocal))
            work.fields[field].type = type
            setMappingLocal(work) 
        }
    }

    const updateFieldExternalName = async (field: string, name: string) => {
        if (mappingLocal) {
            let work = JSON.parse(JSON.stringify(mappingLocal))
            work.fields[field].externalName = name
            setMappingLocal(work) 
        }
    }

    return  (
        <Box>

            { contentTypeNames && mappingLocal && (

                // TODO: Remove this ts-ignore and fix this typing properly.
                // @ts-ignore
                Object.entries(contentTypeNames).map(([fieldIndex,fieldName]) => {
                    
                    return (
                        
                        // TODO: Look into zebra striping the rows, or at least if we're using a border separator, use Strapi UI properly for that
                        <Box key={'field-'+fieldIndex} style={{borderBottom:'1px solid #CCCCCC'}}>

                            <Flex padding={4} gap={4}>

                                {mappingLocal.fields && mappingLocal.fields[fieldName] && (
                                    <Typography variant="beta">
                                        { fieldName }
                                    </Typography>
                                )}
                                {(!mappingLocal.fields || !mappingLocal.fields[fieldName]) && (
                                    <Typography variant="delta">
                                        { fieldName }
                                    </Typography>
                                )}
                                

                                { (!mappingLocal.fields || (mappingLocal.fields && !mappingLocal.fields[fieldName])) && (
                                    <Button variant="tertiary"
                                    onClick={ () => updateFieldAdd(fieldName)}
                                    // TODO: Can this whiteSpace be a strapi UI attribute?
                                    style={{ whiteSpace: 'nowrap' }}
                                    endIcon={<Plus />}>
                                        Add this field
                                    </Button>                                    
                                )}
                            </Flex>

                            { mappingLocal.fields && mappingLocal.fields[fieldName] && (
                                <Box padding={4} style={{paddingTop:'0'}}>

                                    <Flex gap={6} width='100%'>

                                        <Flex height="100%" gap={4} direction="column" justifyContent="center">
                                            <Box>
                                                <Typography variant="pi" fontWeight={'bold'}>Active</Typography>
                                                <Flex gap={2} alignItems="center">
                                                    <Switch
                                                    selected={ mappingLocal.fields[fieldName].active ? true : false }
                                                    onChange={() => updateFieldActive(fieldName)}                                        
                                                    label='Active'
                                                    onLabel='Enabled'
                                                    offLabel='Disabled' />
                                                    <Tooltip label={`Enabled = When a ${mappingLocal.post_type} document is updated, this field will be saved into the ES instance.`}>
                                                        <button aria-label="Tip for Active switch">
                                                            <Icon as={Information} color="neutral300" variant="primary" />
                                                            {/* TODO: Why are these attributes a problem? Re-add them and find out what else we should have here. */}
                                                            {/* aria-hidden focusable={false} */}
                                                        </button>
                                                    </Tooltip>
                                                </Flex>
                                            </Box>

                                            <Box>
                                                <Typography variant="pi" fontWeight={'bold'}>Index</Typography>
                                                <Flex gap={2} alignItems="center">                                                    
                                                    <Switch
                                                    selected={ mappingLocal.fields[fieldName].index ? true : false }
                                                    onChange={() => updateFieldIndex(fieldName)}                                        
                                                    label='Index'
                                                    onLabel='Enabled'
                                                    offLabel='Disabled' />
                                                    <Tooltip label="Enabled = In the ES instance, this field will be indexed, making it searcheable. Disabled = Field is not searcheable, but is better for performance and disk space.">
                                                        <button aria-label="Tip for Index switch">
                                                            <Icon as={Information} color="neutral300" variant="primary" />
                                                            {/* TODO: Why are these attributes a problem? Re-add them and find out what else we should have here. */}
                                                            {/* aria-hidden focusable={false} */}
                                                        </button>
                                                    </Tooltip>
                                                </Flex>
                                            </Box>
                                        </Flex>

                                        <Flex flex="1" direction="column" justifyContent="start" gap={4}>
                                            <Box width="100%" flex="1">
                                                <SingleSelect
                                                label="Data Type"
                                                placeholder="Select data type" name="Data Type"
                                                value={ mappingLocal.fields[fieldName].type }
                                                onChange={ (e:string) => updateFieldDataType(fieldName, e)}>
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

                                            <Box width="100%" flex="1">
                                                <TextInput
                                                label="Custom field name (in ES)"
                                                placeholder="Enter custom field name"
                                                name="Custom field name"
                                                onChange={ (e:Event) => updateFieldExternalName(fieldName, (e.target as HTMLInputElement).value)}
                                                value={mappingLocal.fields[fieldName].externalName ? mappingLocal.fields[fieldName].externalName : ''}
                                                />
                                            </Box>
                                        </Flex>

                                    </Flex>

                                </Box>
                            )}

                        </Box>

                    )
                
                })                            
                    
            )}

        </Box>
    )
}