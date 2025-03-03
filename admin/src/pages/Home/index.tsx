/**
 *
 * PAGE: Home
 * 
 */

import { useState, useEffect } from 'react'
import { SubNavigation } from '../../components/SubNavigation'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { Refresh } from '@strapi/icons'
import { Box, Flex, Switch, Loader, ToggleInput, RadioGroup, Radio, Tab, TwoColsLayout, Button, IconButton, Table, Tr, Td, Grid, GridItem, Divider, Checkbox, ContentLayout, Container, ActionLayout, Layout, Link, Option, Select, Typography } from '@strapi/design-system';
import axiosInstance  from '../../utils/axiosInstance'
import { apiGetPluginSettings, apiGetSystemInfo, apiForceRebuildIndex, apiTriggerIndexing, apiIndexingEnabled, apiToggleIndexingEnabled, apiToggleUseNewPluginParadigmEnabled, apiInstantIndexing, apiToggleInstantIndexing } from '../../utils/apiUrls'

const PageHome = () => {

    // =========================
    // GENERAL
    // =========================

    const [isInProgress, setIsInProgress] = useState<boolean>(false)
    const [pageHasLoaded, setPageHasLoaded] = useState<boolean>(false)
    const [pluginSettings, setPluginSettings] = useState()
    const [indexingEnabled, setIndexingEnabled] = useState<boolean>(false)
    const [useNewPluginParadigmEnabled, setUseNewPluginParadigmEnabled] = useState<boolean>(false)
    const [IndexingMode, setIndexingMode] = useState<boolean>(false)

    const [ESInstanceSettings, setESInstanceSettings] = useState()

    const showNotification = useNotification()

    const ESdisplayLabels: { [key: string]: string } = {
        'connected': 'Connected',
        'elasticCertificate': 'Certificate',
        'elasticHost': 'Elasticsearch host',
        'elasticIndexAlias': 'Elasticsearch index Alias name',
        'elasticUserName': 'Elasticsearch username',
        'indexingCronSchedule': 'Indexing cron schedule',
        'initialized': 'Elasticsearch configuration loaded'
    }

    // =========================
    // API REQUESTS
    // =========================

    const requestGetPluginSettings = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiGetPluginSettings)
        .then((response) => {
            console.log("Plugin settings are: ", response.data)
            setPluginSettings(response.data)
            setIndexingEnabled(response.data.settingIndexingEnabled)
            setIndexingMode(response.data.settingInstantIndex)
            setUseNewPluginParadigmEnabled(response.data.useNewPluginParadigm)
        })
        .catch((error) => {
            console.log("requestGetPluginSettings error", error)
            showNotification({
                type: "warning", message: "An error was encountered.", timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
        })
    }

    // const requestUpdatePluginSettings = async () => {
    //     setIsInProgress(true)
    //     await axiosInstance.get(apiUpdatePluginSettings)
    //     .then((response) => {
    //         console.log("Plugin settings are: ", response.data)
    //         setPluginSettings(response.data)
    //         setIndexingEnabled(response.data.settingIndexingEnabled)
    //         setIndexingMode(response.data.settingInstantIndex)
    //         setUseNewPluginParadigmEnabled(response.data.useNewPluginParadigm)
    //     })
    //     .catch((error) => {
    //         console.log("requestUpdatePluginSettings error", error)
    //         showNotification({
    //             type: "warning", message: "An error was encountered.", timeout: 5000
    //         })
    //     })
    //     .finally(() => {
    //         setIsInProgress(false)
    //     })
    // }


    const requestLoadSystemInfo = async (showNotificationAfter?: boolean) => {
        setIsInProgress(true)
        await axiosInstance.get(apiGetSystemInfo)
        .then((response) => {
            setESInstanceSettings(response.data)
        })
        .catch((error) => {
            console.log("requestLoadSystemInfo error", error)
            showNotification({
                type: "warning", message: "An error was encountered.", timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
            if (showNotificationAfter) {
                showNotification({
                    type: "success", message: "System information reloaded.", timeout: 5000
                })
            }
        })
    }

    const requestForceRebuildIndex = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiForceRebuildIndex)
            .then(() => {
                showNotification({
                    type: "success", message: "Rebuilding the index is triggered.", timeout: 5000
                })
            })
            .catch((error) => {
                console.log("requestForceRebuildIndex error", error)
                showNotification({
                    type: "warning", message: "An error has encountered.", timeout: 5000
                })
            })
            .finally(() => setIsInProgress(false))
    }

    const requestTriggerIndexing = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiTriggerIndexing)
        .then(() => {
            showNotification({
                type: "success", message: "The indexing job to process the pending tasks is started.", timeout: 5000
            })
        })
        .catch((error) => {
            console.log("requestTriggerIndexing error", error)
            showNotification({
                type: "warning", message: "An error was encountered.", timeout: 5000
            })
        })
        .finally(() => setIsInProgress(false))
    }

    const requestGetIndexingMode = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiInstantIndexing)
        .then((response) => {
            setIndexingMode(response.data)
        })
        .catch((error) => {
            console.log("requestGetIndexingMode error", error)
            showNotification({
                type: "warning", message: "An error was encountered.", timeout: 5000
            })
        })
        .finally(() => setIsInProgress(false))
    }

    const requestToggleIndexingMode = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiToggleInstantIndexing)
        .then((response) => {
            setIndexingMode(response.data)
        })
        .catch((error) => {
            console.log("requestToggleIndexingMode error:", error)
            showNotification({
                type: "warning", message: "An error was encountered.", timeout: 5000
            })
        })
        .finally(() => setIsInProgress(false))
    }

    const requestGetIndexingEnabled = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiIndexingEnabled)
        .then( (response) => {
            setIndexingEnabled(response.data)
        })
        .catch( (error) => {
            console.log("requestGetIndexingEnabled error:", error)
            showNotification({
                type: "warning", message: "An error was encountered.", timeout: 5000
            })
        })
        .finally(() => setIsInProgress(false))
    }
    
    const requestToggleIndexingEnabled = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiToggleIndexingEnabled)
        .then( (response) => {
            setIndexingEnabled(response.data)
        })
        .catch( (error) => {
            console.log("requestToggleUseNewPluginParadigmEnabled error:", error)
            showNotification({
                type: "warning", message: "An error was encountered.", timeout: 5000
            })
        })
        .finally(() => setIsInProgress(false))
    }

    const requestToggleUseNewPluginParadigmEnabled = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiToggleUseNewPluginParadigmEnabled)
        .then( (response) => {
            setUseNewPluginParadigmEnabled(response.data)
        })
        .catch( (error) => {
            console.log("requestToggleUseNewPluginParadigmEnabled error:", error)
            showNotification({
                type: "warning", message: "An error was encountered trying to set UseNewPluginParadigm.", timeout: 5000
            })
        })
        .finally(() => setIsInProgress(false))
    }

    // =========================
    // LIFECYCLE STUFF
    // =========================

    useEffect(() => {
        requestGetPluginSettings()
        requestLoadSystemInfo()
    }, [])

    useEffect(() => {
        // TODO: Can we eliminate this timeout? Doing it to minimize FOUC due to the EmptyStateLayout view. 
        setTimeout(() => {
            setPageHasLoaded(true)            
        }, 200)
    }, [])

    // =========================
    // TEMPLATE
    // =========================
 
    return (
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />

            { !pageHasLoaded && (
                <Flex width="100%" height="100%" justifyContent="center">
                    <Loader />
                </Flex>
            )}

            { pageHasLoaded && (
                <Flex direction="column" alignItems="start" gap={8} padding={8} background="neutral100" width="100%">
                    <Box>
                        <Typography variant="alpha">Home</Typography>
                    </Box>

                    {/* ---------------------------------------------- */}
                    {/* HEADER */}
                    {/* ---------------------------------------------- */}
                    <Flex direction="column" alignItems="start" gap={8} width="100%">
                        <Box style={{ alignSelf: 'stretch' }} background="neutral0" padding="32px" hasRadius={true}>
                            <Flex direction="column" alignItems="start" gap={8}>

                                <Typography variant="beta">Basics</Typography>

                                <Flex direction="column" alignItems="start" gap={6}>
                                    <Box>
                                        <Flex gap={4}>
                                            <Typography variant="delta">Indexing</Typography>
                                            <Switch 
                                                onClick={ () => requestToggleIndexingEnabled() }
                                                selected={indexingEnabled}
                                                visibleLabels
                                                onLabel = 'Enabled'
                                                offLabel = 'Disabled'
                                            />
                                        </Flex>
                                    </Box>

                                    { pluginSettings && (
                                        <Box>
                                            <Flex gap={4}>
                                                <Typography variant="delta">Use new paradigm</Typography>
                                                <Switch 
                                                    onClick={ () => requestToggleUseNewPluginParadigmEnabled() }
                                                    selected={useNewPluginParadigmEnabled}
                                                    visibleLabels
                                                    onLabel = 'Enabled'
                                                    offLabel = 'Disabled'
                                                />
                                            </Flex>
                                        </Box>
                                    )}

                                    <Box>
                                        <Flex gap={4}>
                                            <Typography variant="delta">Mode</Typography>
                                            {/* <ToggleInput
                                                checked={IndexingMode}
                                                onChange={ () => requestToggleIndexingMode() }
                                                selected={IndexingMode}
                                                onLabel = 'Scheduled Indexing'
                                                offLabel = 'Instant Indexing'
                                            /> */}
                                            <RadioGroup
                                                value={ IndexingMode ? 'instant' : 'scheduled' }
                                                onChange={ () => requestToggleIndexingMode() }
                                            >
                                                <Flex gap={4}>
                                                    <Radio value="instant">
                                                        Instant Indexing
                                                    </Radio>
                                                    <Radio value="scheduled">
                                                        Scheduled Indexing
                                                    </Radio>
                                                </Flex>
                                            </RadioGroup>

                                        </Flex>
                                        {/* onCheckedChange={requestToggleIndexingMode()} */}
                                        {/* {IndexingMode && (<div>IndexingMode: true</div>)} */}
                                    </Box>

                                    <Box>
                                        <Flex gap={4}>
                                            <Typography variant="delta">Actions</Typography>
                                            <Button loading={isInProgress} fullWidth variant="secondary" onClick={ () => requestForceRebuildIndex() }>Force Rebuild Index</Button>
                                            <Button loading={isInProgress} fullWidth variant="secondary" onClick={ () => requestTriggerIndexing() }>Trigger Scheduled Indexing</Button>
                                        </Flex>
                                    </Box>

                                </Flex>

                            </Flex>
                        </Box>
                    </Flex>


                    {/* ---------------------------------------------- */}
                    {/* MAIN CONTENT */}
                    {/* ---------------------------------------------- */}
                    <Flex direction="column" alignItems="start" gap={8} width="100%">
                        <Box style={{ alignSelf: 'stretch' }} background="neutral0" padding="32px" hasRadius={true}>
                            <Flex direction="column" alignItems="start" gap={8}>

                                <Typography variant="beta">Connection</Typography>

                                { ESInstanceSettings && (
                                    <Box>
                                        <Typography variant="delta">Connected</Typography>
                                        <Flex>
                                            <Box padding={2}>
                                                { ESInstanceSettings['connected'] && ESInstanceSettings['connected'] === true && (
                                                    <Typography fontWeight="bold" textColor="success500">Yes</Typography>
                                                )}
                                                { ESInstanceSettings['connected'] && ESInstanceSettings['connected'] === false && (
                                                    <Typography fontWeight="bold" textColor="danger500">No</Typography>
                                                )}
                                            </Box>
                                            <Box padding={1}>
                                                { ESInstanceSettings['connected'] ?
                                                    <IconButton disabled={isInProgress} onClick={ () => requestLoadSystemInfo(true) } label="Refresh" icon={<Refresh />} />
                                                : null }
                                            </Box>
                                        </Flex>
                                    </Box>
                                )}

                                <Box>
                                    { ESInstanceSettings && (
                                        Object.keys(ESInstanceSettings).map((k, idx) => {
                                            if (k !== 'connected') {
                                                return (
                                                    <Flex key={idx} gap={2} justifyBetween>
                                                        <Box>
                                                            <Typography textColor="neutral600">{ ESdisplayLabels[k] }:</Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography textColor="neutral600">{ String(ESInstanceSettings[k]) }</Typography>
                                                        </Box>                                            
                                                    </Flex>
                                                )
                                            }
                                        })                                
                                    ) }
                                </Box>
        

                            </Flex>
                        </Box>
                    </Flex>

                    {/* <Box width="100%" paddingBottom={4}>
                        <TwoColsLayout startCol={
                            <>
                            Column 1
                        </>}

                        endCol={<>
                            Column 2
                            </>
                        } />
                    </Box> */}
                </Flex>
            )}
        </Flex>
    )
}

export default PageHome