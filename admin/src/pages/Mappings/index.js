import React, { useState, useEffect } from 'react'
// import PropTypes from 'prop-types'
import pluginId from '../../pluginId'
import  { SubNavigation } from '../../components/SubNavigation'
import { Box, Flex, Button, ModalLayout, ModalHeader, ModalFooter, ModalBody, Table, Thead, Tbody, Tr, Td, Th, TFooter, EmptyStateLayout, Checkbox, TextInput, IconButton, CaretDown } from '@strapi/design-system'
import Pencil from '@strapi/icons/Pencil'
import Trash from '@strapi/icons/Trash'
import Plus from '@strapi/icons/Plus'

import axiosInstance  from '../../utils/axiosInstance'
import { Typography } from '@strapi/design-system'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'

import { apiGetMappings, apiCreateMapping, apiDeleteMapping } from '../../utils/apiUrls'

const PageMappings = () => {

    const [isInProgress, setIsInProgress] = useState(false)
    const [logTable, setLogTable] = useState(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newMapping, setNewMapping] = useState('')
    const showNotification = useNotification()

    useEffect(() => {
        console.log("112232345jjjj")
        requestGetMappings()
        //.then(setLogTable)
    }, [])

    const requestGetMappings = () => {
        setIsInProgress(true)
        axiosInstance.get(apiGetMappings)
            .then((response) => {
                console.log("get requestGetMappings data is: ", response)
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    setLogTable(response.data)
                } else {
                    setLogTable(null)
                }
            })
            .catch((error) => {
                console.log("PAGE requestGetMappings ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
            
    } 

    const requestCreateMapping = (mapping) => {
        setIsInProgress(true)

        console.log("mappingName is: ", mapping)

        return axiosInstance.post(apiCreateMapping, {
            data: mapping
        })
            .then((response) => {
                console.log("PAGE requestCreateMapping response: ", response)
                showNotification({
                    type: "success", message: "Created the mapping: " + response, timeout: 5000
                })
            })
            .catch((error) => {
                console.log("PAGE requestCreateMapping ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                //setIsInProgress(false)
                requestGetMappings()
            })
    }

    const modalCreateMappingOpen = () => {
        console.log("Opening modal....")
        setShowCreateModal(true)
    }

    const modalCreateMappingClose = () => {
        setShowCreateModal(false)
    }

    const createMappingActual = () => {
        setShowCreateModal(false)
        //console.log("Helllo???", newMapping)

        let newMappingTest = {
            "post_type": 'posttypefoo',
            "mapping": 'somemapping',
            //"preset": 'dfdf'
            //"nested_level": 2
            //"registered_index": 'someregindex'
            //"mapping_type": 'custom',
            //"default_preset": true
        }
        requestCreateMapping(newMappingTest)
    }

    const requestDeleteMapping = (mappingIDNumber) => {
        setIsInProgress(true)
        return axiosInstance.get(apiDeleteMapping(mappingIDNumber))
            .then((response) => {
                console.log("PAGE requestDeleteMapping response: ", response)
                showNotification({
                    type: "success", message: "Deleted the mapping: " + response, timeout: 5000
                })
            })
            .catch((error) => {
                console.log("PAGE requestDeleteMapping ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                //setIsInProgress(false)
                requestGetMappings()
            })
    }

    return (
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />

            <Flex direction="column" alignItems="start" gap={8} padding={8} background="neutral100" width="100%">
                <Box>
                    <Typography variant="alpha">Mappings</Typography>
                </Box>

                <Flex direction="column" alignItems="start" gap={8} width="100%">
                    <Box style={{ alignSelf: 'stretch' }} background="neutral0" padding="32px" hasRadius={true}>
                        <Flex direction="column" alignItems="start" gap={8}>

                            <Typography variant="beta">Mappings</Typography>
                            <Typography variant="delta">All forms of mappings in the context of this plugin</Typography>

                            <Box>
                                <Flex gap={4}>
                                    <Typography variant="delta">Actions</Typography>
                                    <Button loading={isInProgress} fullWidth variant="secondary" onClick={requestGetMappings}>Reload list</Button>
                                    <Button loading={isInProgress} fullWidth variant="secondary" onClick={modalCreateMappingOpen}>Create Preset Mapping</Button>
                                </Flex>
                            </Box>
                        </Flex>
                    </Box>
                </Flex>


                <Box width="100%">
                    {
                        !logTable || (logTable && logTable.length === 0) && (
                            <EmptyStateLayout icon={<Cross />} content="You don't have any content yet..." action={
                                <Button variant="secondary" startIcon={<Plus />}>
                                    Create a preset mapping
                                </Button>
                            } />
                        )
                    }

                    {
                        logTable && Array.isArray(logTable) && logTable.length > 0 && (
                        <>
                            <Table colCount={3} rowCount={logTable.length} width="100%">
                            {/* footer={<TFooter icon={<Plus />}>Add another field to this collection type</TFooter>} */}
                                <Thead>
                                    <Tr>
                                        <Th>
                                            <Checkbox aria-label="Select all entries" />
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
                                {
                                    logTable.map((data, index) => {
                                    return (
                                        <Tr key={index}>
                                            <Td>
                                                <Checkbox aria-label={`Select ${data.id}`} />
                                            </Td>
                                            <Td>
                                                <Typography textColor="neutral600">{data.post_type}</Typography>
                                            </Td>
                                            <Td>
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
                                                    <IconButton onClick={() => console.log('edit')} label="Edit" borderWidth={0}>
                                                        <Pencil />
                                                    </IconButton>                                                    
                                                    <IconButton onClick={() => requestDeleteMapping(data.id)} label="Delete" borderWidth={0}>
                                                        <Trash />
                                                    </IconButton>                                                    
                                                </Flex>
                                            </Td>
                                        </Tr>
                                    )
                                    })
                                }
                                </Tbody>
                            </Table>
                            <Box paddingTop={2} paddingBottom={2}>
                                <Typography textColor="neutral600">This view lists mappings (in the context of this plugin).</Typography>
                            </Box>
                        </>
                        )
                    }
                </Box>


                {
                    showCreateModal && (
                    <ModalLayout onClose={modalCreateMappingClose}>
                        {/* labelledBy="title" */}
                        <ModalHeader>
                            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                                Create preset mapping
                            </Typography>
                        </ModalHeader>
                        <ModalBody>
                            Create preset mapping
                            
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



                            
                            <Button onClick={createMappingActual} variant="tertiary">
                                Create Mapping
                            </Button>

                            {/* {showFileDragAndDrop && (
                                <>
                                <Typography textColor="neutral800" fontWeight="bold" as="h2">
                                    {i18n('plugin.import.data-source-step.title')}
                                </Typography>
                                <Flex gap={4}>
                                    <label
                                    className={`plugin-ie-import_modal_label ${labelClassNames}`}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    >
                                    <span className="plugin-ie-import_modal_label-icon-wrapper">
                                        <IconFile />
                                    </span>
                                    <Typography style={{ fontSize: '1rem', fontWeight: 500 }} textColor="neutral600" as="p">
                                        {i18n('plugin.import.drag-drop-file')}
                                    </Typography>
                                    <input type="file" accept=".csv,.json" hidden="" onChange={onReadFile} />
                                    </label>
                                    <label className="plugin-ie-import_modal_label plugin-ie-import_modal_button-label" onClick={openCodeEditor}>
                                    <span className="plugin-ie-import_modal_label-icon-wrapper">
                                        <IconCode />
                                    </span>
                                    <Typography style={{ fontSize: '1rem', fontWeight: 500 }} textColor="neutral600" as="p">
                                        {i18n('plugin.import.use-code-editor')}
                                    </Typography>
                                    </label>
                                </Flex>
                                </>
                            )}
                            {showLoader && (
                                <>
                                <Flex justifyContent="center">
                                    <Loader>{i18n('plugin.import.importing-data')}</Loader>
                                </Flex>
                                </>
                            )}
                            {showEditor && <ImportEditor file={file} data={data} dataFormat={dataFormat} slug={slug} onDataChanged={onDataChanged} onOptionsChanged={onOptionsChanged} />}
                            {showSuccess && (
                                <>
                                <EmptyStateLayout
                                    icon={<Icon width="6rem" height="6rem" color="success500" as={CheckCircle} />}
                                    content={i18n('plugin.message.import.success.imported-successfully')}
                                    action={
                                    <Button onClick={modalCreateMappingClose} variant="tertiary">
                                        {i18n('plugin.cta.close')}
                                    </Button>
                                    }
                                />
                                </>
                            )}
                            {showPartialSuccess && (
                                <>
                                <Typography textColor="neutral800" fontWeight="bold" as="h2">
                                    {i18n('plugin.import.partially-failed')}
                                </Typography>
                                <Typography textColor="neutral800" as="p">
                                    {i18n('plugin.import.detailed-information')}
                                </Typography>
                                <Editor content={importFailuresContent} language={'json'} readOnly />
                                </>
                            )} */}
                        </ModalBody>
                        {/* <ModalFooter
                            startActions={
                                <>
                                {showRemoveFileButton && (
                                    <Button onClick={resetDataSource} variant="tertiary">
                                    {i18n('plugin.cta.back-to-data-sources')}
                                    </Button>
                                )}
                                </>
                            }
                            endActions={
                                <>
                                {showImportButton && <Button onClick={uploadData}>{i18n('plugin.cta.import')}</Button>}
                                {showPartialSuccess && (
                                    <Button variant="secondary" onClick={copyToClipboard}>
                                    {i18n('plugin.cta.copy-to-clipboard')}
                                    </Button>
                                )}
                                </>
                            }
                        /> */}
                    </ModalLayout>

                    )
                }



            </Flex>


            

        </Flex>




          


    )

}

export default PageMappings
