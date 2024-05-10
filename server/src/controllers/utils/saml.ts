// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios from 'axios';
import {DOMParser} from 'xmldom';
import {SelectReturnType, isArrayOfNodes, useNamespaces} from 'xpath';

type selectFun = (query: string) => SelectReturnType;

export const fetchIdpMetadata = async (
  metadataUrl: string
): Promise<selectFun | null> => {
  try {
    const res = await axios.get<string>(metadataUrl);
    const parser = new DOMParser();
    const xml = parser.parseFromString(res.data, 'application/xml');
    const select = useNamespaces({
      md: 'urn:oasis:names:tc:SAML:2.0:metadata',
      saml: 'urn:oasis:names:tc:SAML:2.0:assertion',
      ds: 'http://www.w3.org/2000/09/xmldsig#',
    });
    return query => select(query, xml);
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getIdpSignCert = async (
  metadataUrl: string
): Promise<string | null | undefined> => {
  const query = await fetchIdpMetadata(metadataUrl);
  if (query) {
    const res = query(
      '//md:IDPSSODescriptor/md:KeyDescriptor[@use="signing" or not(@use)]/ds:KeyInfo/ds:X509Data/ds:X509Certificate'
    );
    if (isArrayOfNodes(res)) {
      return res.map(node => node.firstChild?.nodeValue)[0]?.trim();
    }
  }
  return null;
};
