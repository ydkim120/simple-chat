import { defineStore } from "pinia"

import type { confirmDialog } from '@/@types'

// export interface alertDialogState {
//   isOpenConfirmDialog: boolean;
//   confirmDialogInfo: object
// }

export const alertDialogStore: any = defineStore({
  id: 'alertDialog',
  state: () => ({
    isOpenConfirmDialog: false,
    confirmDialogInfo: null,
  }),
  getters: {
    isOpenConfirmDialog: (state) => state.isOpenConfirmDialog,
    confirmDialogInfo: (state) => state.confirmDialogInfo
  },
  actions: {
    openAlertDialog(payload: confirmDialog) {
      this.confirmDialogInfo = payload
      this.isOpenConfirmDialog =true
    },
    closeAlertDialog() {
      this.confirmDialogInfo = null
      this.isOpenConfirmDialog = false
    }
  }
})