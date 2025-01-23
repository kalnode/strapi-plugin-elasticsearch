import React from 'react'
import { Connector } from '@strapi/icons'
import { Box } from '@strapi/design-system'
import { SubNav, SubNavHeader, SubNavSection, SubNavSections, SubNavLink } from '@strapi/design-system/v2'
import { NavLink } from 'react-router-dom'
import pluginId from "../../pluginId"

export const SubNavigation = ({activeUrl}) => {
    const links = [
        {
            id: 1,
            label : 'Home',
            icon : Connector,
            to : `/plugins/${pluginId}/home`
        },
        {
            id: 2,
            label : 'Indexes',
            icon : Connector,
            to : `/plugins/${pluginId}/indexes`
        },
        {
            id: 3,
            label : 'Configure Collections',
            icon : Connector,
            to : `/plugins/${pluginId}/configure-collections`
        },
        {
            id: 4,
            label : 'Indexing Run Logs',
            icon : Connector,
            to : `/plugins/${pluginId}/view-indexing-logs`
        },
        {
            id: 5,
            label : 'Tools',
            icon : Connector,
            to : `/plugins/${pluginId}/tools`
        }
    ]

    return (<Box style={{ height: '100vh' }} background="neutral200">
        <SubNav ariaLabel="Settings sub nav">
            <SubNavHeader label="Strapi Elasticsearch" />
            <SubNavSections>
                <SubNavSection>
                    {links.map(
                        link => link.icon &&
                        <SubNavLink as={NavLink} to={link.to} icon={link.icon} key={link.id}>
                            {link.label}
                        </SubNavLink>)
                    }
                </SubNavSection>
            </SubNavSections>
        </SubNav>
    </Box>)
}