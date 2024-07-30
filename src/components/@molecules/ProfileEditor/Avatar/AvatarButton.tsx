import { ComponentProps, Dispatch, SetStateAction, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { Avatar, Button, Dropdown } from '@ensdomains/thorin'
import { DropdownItem } from '@ensdomains/thorin/dist/types/components/molecules/Dropdown/Dropdown'

import { LegacyDropdown } from '@app/components/@molecules/LegacyDropdown/LegacyDropdown'

const ActionContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space[2]};
  `,
)

const Container = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space[4]};
  `,
)

const AvatarWrapper = styled.div(
  () => css`
    width: 120px;
    height: 120px;
  `,
)

export type AvatarClickType = 'upload' | 'nft' | 'manual'

type PickedDropdownProps = Pick<ComponentProps<typeof Dropdown>, 'isOpen' | 'setIsOpen'>

type Props = {
  validated?: boolean
  dirty?: boolean
  error?: boolean
  src?: string
  onSelectOption?: (value: AvatarClickType) => void
  onAvatarChange?: (avatar?: string) => void
  onAvatarSrcChange?: (src?: string) => void
  onAvatarFileChange?: (file?: File) => void
} & PickedDropdownProps

const AvatarButton = ({
  validated,
  src,
  onSelectOption,
  onAvatarChange,
  onAvatarSrcChange,
  onAvatarFileChange,
  isOpen,
  setIsOpen,
}: Props) => {
  const { t } = useTranslation('transactionFlow')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleSelectOption = (value: AvatarClickType | 'remove') => () => {
    if (value === 'remove') {
      onAvatarChange?.(undefined)
      onAvatarSrcChange?.(undefined)
    } else if (value === 'upload') {
      fileInputRef.current?.click()
    } else {
      onSelectOption?.(value)
    }
  }

  const dropdownProps = setIsOpen
    ? ({ isOpen, setIsOpen } as { isOpen: boolean; setIsOpen: Dispatch<SetStateAction<boolean>> })
    : ({} as { isOpen: never; setIsOpen: never })

  return (
    <Container>
      <AvatarWrapper>
        <Avatar label="profile-button-avatar" src={src} noBorder />
      </AvatarWrapper>
      <LegacyDropdown
        items={
          [
            {
              label: t('input.profileEditor.tabs.avatar.dropdown.selectNFT'),
              color: 'black',
              onClick: handleSelectOption('nft'),
            },
            {
              label: t('input.profileEditor.tabs.avatar.dropdown.uploadImage'),
              color: 'black',
              onClick: handleSelectOption('upload'),
            },
            {
              label: t('input.profileEditor.tabs.avatar.dropdown.enterManually'),
              color: 'black',
              onClick: handleSelectOption('manual'),
            },
            ...(validated
              ? [
                  {
                    label: t('action.remove', { ns: 'common' }),
                    color: 'red',
                    onClick: handleSelectOption('remove'),
                  },
                ]
              : []),
          ] as DropdownItem[]
        }
        keepMenuOnTop
        shortThrow
        {...dropdownProps}
      >
        <ActionContainer>
          <Button disabled colorStyle="accentSecondary">
            {src}
          </Button>
          <Button colorStyle="accentSecondary">
            {t('input.profileEditor.tabs.avatar.change')}
          </Button>
        </ActionContainer>
        <input
          type="file"
          style={{ display: 'none' }}
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onSelectOption?.('upload')
              onAvatarFileChange?.(e.target.files[0])
            }
          }}
        />
      </LegacyDropdown>
    </Container>
  )
}

export default AvatarButton
