import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Header from './Header';

const Faq = () => {
    const { t } = useTranslation();
    const [showMsg, setShowMsg] = useState(false)

    return (
        <div>
            <Header />

            <div className=" md:w-10/12 mx-auto md:p-20 p-4">
                <h1 className="font-bold md:text-4xl  text-2xl font-Anek text-center">{t('faq.title')}</h1>


                <div className="flex flex-wrap justify-center mt-20 font-Inter">

                    <div className="md:w-5/12 m-4 ">
                        <p className="text-xl font-bold py-2">{t('faq.q1')}</p>
                        <p className="text-lg text-gray-700">{t('faq.a1')}</p>
                    </div>

                    <div className="md:w-5/12 m-4">
                        <p className="text-xl font-bold py-2">{t('faq.q2')}</p>
                        <p className="text-lg text-gray-700">{t('faq.a2')}</p>
                    </div>

                    <div className="md:w-5/12 m-4">
                        <p className="text-xl  font-bold py-2">{t('faq.q3')}</p>
                        <p className="text-lg text-gray-700">
                            <Trans i18nKey="faq.a3">
                                Yes. Just search and select <span className="font-semibold">custom</span> in icon section and you can upload your own logo to personalize your cover images.
                            </Trans>
                        </p>
                        <p className="italic mt-2">
                            <Trans i18nKey="faq.seeExample">
                                See <a href="https://twitter.com/WankhadeRutik/status/1518270774335111168?s=20&t=XMjbJpGAC7anadJ690_DUg" className="text-blue-400" target="_blank" rel="noreferrer">example</a>
                            </Trans>
                        </p>
                    </div>

                    <div className="md:w-5/12 m-4">
                        <p className="text-xl font-bold my-2">{t('faq.q4')}</p>
                        <p className="text-lg text-gray-700">{t('faq.a4')}</p>
                    </div>

                    <div className="md:w-5/12 m-4">
                        <p className="text-xl font-bold my-2">{t('faq.q5')}</p>
                        <p className="text-lg text-gray-700">{t('faq.a5')}</p>
                    </div>

                    <div className="md:w-5/12 m-4">
                        <p className="text-xl font-bold my-2">{t('faq.q6')}</p>
                        <p className="text-lg text-gray-700">
                            <Trans i18nKey="faq.a6">
                                If coverview adds value in your life and you wish to support this project, you can <a href="https://github.com/sponsors/rutikwankhade" target="_blank" rel="noreferrer" className="font-semibold hover:underline">sponsor me on Github</a>.
                            </Trans>
                        </p>
                    </div>

                    <div className="md:w-5/12 m-4">
                        <p className="text-xl font-bold my-2">{t('faq.q7')}</p>
                        <p className="text-lg text-gray-700">
                            <Trans i18nKey="faq.a7">
                                This project's initial version was developed by <a href="https://github.com/rutikwankhade" target="_blank" rel="noreferrer" className="font-semibold hover:underline">rutikwankhade</a>. The current version is developed by <a href="https://github.com/z4none/CoverView" target="_blank" rel="noreferrer" className="font-semibold hover:underline">z4none/CoverView</a>.
                            </Trans>
                        </p>
                    </div>

                </div>

                <div className="md:w-1/2 mx-auto text-center mt-20">
                    <button
                        onClick={() => setShowMsg(!showMsg)}
                        className="text-6xl text-center m-2">💡</button>
                    <p className="text-xl font-Anek font-semibold text-gray-800">{t('faq.secretTitle')}</p>

                </div>

                {
                    showMsg ?
                        <div>
                            <h2 className="md:w-7/12 text-4xl border text-center mx-auto my-10 p-10 rounded-xl shadow-sm font-Nunito">{t('faq.secretMessage')}</h2>
                        </div> :
                        <div></div>
                }

            </div>
        </div>
    );
}

export default Faq;