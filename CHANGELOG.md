# Changelog

All notable changes to this project will be documented in this file.

# [0.1.2] - 2026-05-07
- General Bug Fix

# [0.1.1] - 2026-02-12
- Add Manage SpecialPrices on LayerOne2SL Get / List / Create / Delete / Update

# [0.1.0] - 2025-08-19
- Add Manage Dynamic Login on LayerOneConfigs and manage CustomHeader on configuration
> *Warning Breaking Change!* please make backups of flows & Configuration and try in test environment before upgrading
- Add Manage NextLink on ServiceNode
> the node ServiceNode does *not manage “NextLink” directly* as it is very case-dependent, the property is provided and *delegated to the flow for management*
- Bug fix view on PatchSAP Node
- General Bug Fix
- Library Axios & Odata Updated

# [0.0.12] - 2025-08-06
- add Manage UserFieldsMD on you-layerone2-sl-create / you-layerone2-sl-list / you-layerone2-sl-delete 
> Not add Manage on you-layerone2-sl-get becose not work on corrent ServiceLayer Version

# [0.0.11] - 2025-07-09
- General Bug Fix on you-layerone2-sl-manipolate-entity and you-layerone2-sl-close 

# [0.0.10] - 2025-04-10
- Added error handling configuration from library or manual on you-layerone2-adonet-query
- General Bug Fix on you-layerone2-adonet-query 

# [0.0.9] - 2024-11-04
- Fix sender request on node you-layerone2-adonet-command

# [0.0.8] - 2024-11-04
- Fix compatibility on you-layerone2-sl-service and you-layerone2-sl-manipulate-entity

# [0.0.7] - 2024-11-04
- Bug Fix build request 

# [0.0.6] - 2024-11-01
- Upgrade List on CloseSapSl Node 

# [0.0.5] - 2024-10-25
- Fix valiation field for node-RED >= 3.1.1

# [0.0.4] - 2024-10-15

- We have updated NextLinkSl Node on Manage Url Value

# [0.0.3] - 2024-09-04

- Add Manage AlternateCatNum on LayerOne2SL Get / List / Create / Delete / Update
- General BugFix

# [0.0.2] - 2024-08-12

- BugFix PatchSAP for manage LayerOne2 Empty Response
- General BugFix

# [0.0.1] - 2024-08-09

### First release.

- First public release of Official LayerOne2 for NODE-RED.
